import { combineLatest, map, type Observable, of, switchMap } from "rxjs";
import { type Project, type Expr, ExprType, type NumberExpr, type CallExpr } from "src/ex-object/ExItem";
import type { ExObject } from "src/ex-object/ExObject";
import Logger from "src/utils/logger/Logger";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";
import { assertUnreachable } from "src/utils/utils/Utils";

// @ts-ignore
// const logger = Logger.file("Dehydrator.ts");

export type DehydratedExpr = DehydratedNumberExpr | DehydratedCallExpr;

export interface DehydratedProject {
  id: string;
  name: string;
  rootExObjects: DehydratedExObject[];
}

export interface DehydratedExObject {
  id: string;
  protoExObjectId: string;
  sceneAttributes: DehydratedSceneAttribute[];
  children: DehydratedExObject[];
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
  public dehydrateProject$(project: Project): Observable<DehydratedProject> {
    const deExObjects$ = project.rootExObjects$.pipe(
      switchMap((exObjects) => {
        if (exObjects.length === 0) {
          return of([]);
        }

        return combineLatest(
          exObjects.map((exObject) => {
            return this.dehydrateExObject$(exObject);
          })
        );
      })
    );

    return deExObjects$.pipe(
      map((deExObjects) => {
        return {
          id: project.libraryProject.id,
          name: project.libraryProject.name,
          rootExObjects: deExObjects,
        };
      })
    );
  }

  @loggedMethod
  public dehydrateExObject$(
    exObject: ExObject
  ): Observable<DehydratedExObject> {
    const logger = Logger.logger();

    const protoAttributeBySceneAttributeId = new Map<
      string,
      ProtoSceneProperty
    >();
    for (const [
      protoAttribute,
      sceneAttribute,
    ] of exObject.sceneAttributeByProto) {
      protoAttributeBySceneAttributeId.set(sceneAttribute.id, protoAttribute);
    }

    const deAttr$s = Array.from(exObject.sceneAttributeByProto.values()).map(
      (sceneAttribute) => {
        logger.log("map", "sceneAttribute", sceneAttribute);
        return this.dehydrateAttribute$(sceneAttribute);
      }
    );

    const deAttrs$ = combineLatest(deAttr$s);

    const deChildren$ = exObject.children$.pipe(
      switchMap((children) => {
        logger.log("switchMap", "children", children);
        if (children.length === 0) {
          return of([]);
        }

        return combineLatest(
          children.map((child) => {
            logger.log("map", "child", child);
            return this.dehydrateExObject$(child);
          })
        );
      })
    );

    return combineLatest([deAttrs$, deChildren$]).pipe(
      map(([deAttrs, deChildren]) => {
        return {
          id: exObject.id,
          protoExObjectId: exObject.proto.id,
          sceneAttributes: deAttrs,
          children: deChildren,
        };
      })
    );
  }

  @loggedMethod
  public dehydrateAttribute$(
    attribute: SceneProperty
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
