import { combineLatest, map, type Observable, of, switchMap } from "rxjs";
import {
  type CallExpr,
  Component,
  type Expr,
  ExprType,
  type NumberExpr
} from "src/ex-object/ExObject";
import {
  ProtoSceneAttribute,
  SceneAttribute,
} from "src/ex-object/SceneAttribute";
import Logger from "src/utils/logger/Logger";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";
import { assertUnreachable } from "src/utils/utils/Utils";

// @ts-ignore
// const logger = Logger.file("Dehydrator.ts");

export type DehydratedExpr = DehydratedNumberExpr | DehydratedCallExpr;

export interface DehydratedProject {
  rootComponents: DehydratedComponent[];
}

export interface DehydratedComponent {
  id: string;
  protoComponentId: string;
  sceneAttributes: DehydratedSceneAttribute[];
}

export interface DehydratedSceneAttribute {
  id: string;
  protoSceneAttributeId: string;
  expr: DehydratedExpr;
}

export interface DehydratedNumberExpr {
  type: "NumberExpr";
  id: string;
  value: number;
}

export interface DehydratedCallExpr {
  type: "CallExpr";
  id: string;
  args: DehydratedExpr[];
}

export default class Dehydrator {
  public dehydrateProject$(): Observable<DehydratedProject> {
    throw new Error("Not implemented");
  }

  public dehydrateComponent$(
    component: Component
  ): Observable<DehydratedComponent> {
    const protoAttributeBySceneAttributeId = new Map<
      string,
      ProtoSceneAttribute
    >();
    for (const [
      protoAttribute,
      sceneAttribute,
    ] of component.sceneAttributeByProto) {
      protoAttributeBySceneAttributeId.set(sceneAttribute.id, protoAttribute);
    }

    const deAttr$s = Array.from(component.sceneAttributeByProto.values()).map(
      (sceneAttribute) => {
        return this.dehydrateAttribute$(sceneAttribute);
      }
    );

    return combineLatest(deAttr$s).pipe(
      map((deAttrs) => {
        return {
          id: component.id,
          protoComponentId: component.proto.id,
          sceneAttributes: deAttrs,
        };
      })
    );
  }

  @loggedMethod
  public dehydrateAttribute$(
    attribute: SceneAttribute
  ): Observable<DehydratedSceneAttribute> {
    const logger = Logger.logger();

    return attribute.expr$.pipe(
      switchMap((expr) => {
        return this.dehydrateExpr$(expr);
      }),
      map((dehydratedExpr) => {
        logger.log("map", "dehydratedExpr", dehydratedExpr);
        return {
          id: attribute.id,
          expr: dehydratedExpr,
          protoSceneAttributeId: attribute.proto.id,
        };
      })
    );
  }

  @loggedMethod
  private dehydrateExpr$(expr: Expr): Observable<DehydratedExpr> {
    switch (expr.exprType) {
      case ExprType.NumberExpr:
        return this.dehydrateNumberExpr$(expr);
      case ExprType.CallExpr:
        return this.dehydrateCallExpr$(expr);
      default:
        assertUnreachable(expr);
    }
  }

  private dehydrateNumberExpr$(
    expr: NumberExpr
  ): Observable<DehydratedNumberExpr> {
    return of({
      type: "NumberExpr",
      id: expr.id,
      value: expr.value,
    });
  }

  private dehydrateCallExpr$(expr: CallExpr): Observable<DehydratedCallExpr> {
    const deArgs$ = expr.args$.pipe(
      switchMap((args) => {
        return this.dehydrateArgs$(args);
      })
    );

    const result: Observable<DehydratedCallExpr> = deArgs$.pipe(
      map((deArgs) => {
        return {
          type: "CallExpr",
          id: expr.id,
          args: deArgs,
        };
      })
    );

    return result;
  }

  private dehydrateArgs$(args: readonly Expr[]): Observable<DehydratedExpr[]> {
    return combineLatest(args.map((arg) => this.dehydrateExpr$(arg)));
  }
}
