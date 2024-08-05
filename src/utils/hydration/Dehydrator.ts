import { combineLatest, combineLatestWith, map, type Observable, of, switchMap } from "rxjs";
import { ComponentType } from "src/ex-object/Component";
import { type Project, type Expr, ExprType, type NumberExpr, type CallExpr } from "src/ex-object/ExItem";
import type { ExObject } from "src/ex-object/ExObject";
import { PropertyType, type ComponentParameterProperty, type ObjectProperty } from "src/ex-object/Property";
import Logger from "src/utils/logger/Logger";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";
import { assertUnreachable } from "src/utils/utils/Utils";

export type DehydratedExpr = DehydratedNumberExpr | DehydratedCallExpr;

export interface DehydratedProject {
  id: string;
  name: string;
  rootExObjects: DehydratedExObject[];
}

export interface DehydratedExObject {
  id: string;
  componentId: string;
  componentType: string;
  componentProperties: DehydratedComponentProperty[];
  customProperties: DehydratedProperty[];
  children: DehydratedExObject[];
}

export interface DehydratedComponentProperty {
  id: string;
  expr: DehydratedExpr;
}

export interface DehydratedCustomProperty {
  id: string;
  name: string;
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

    const customProperties$ = exObject.customProperties$.pipe(
      map((properties) => {
        return properties.map((property) => this.dehydrateProperty$(property));
      })
    );

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
        const deExObject: DehydratedExObject = {
          id: exObject.id,
          componentId: exObject.component.id,
          componentType: ComponentType[exObject.component.componentType],
          properties: deAttrs,
          children: deChildren,
        };
        return deExObject;
      })
    );
  }

  @loggedMethod
  public dehydrateComponentProperty$(
    property: ComponentParameterProperty
  ): Observable<DehydratedComponentProperty> {
    const logger = Logger.logger();
    return property.expr$.pipe(
      switchMap((expr) => {
        return this.dehydrateExpr$(expr);
      }),
      map((dehydratedExpr) => {
        logger.log("map", "dehydratedExpr", dehydratedExpr);
        const deProperty: DehydratedComponentProperty = {
          id: property.id,
          expr: dehydratedExpr,
        };
        return deProperty;
      })
    );
  }

  @loggedMethod
  public dehydrateObjectProperty$(
    property: ObjectProperty
  ): Observable<DehydratedObjectProperty> {
    const logger = Logger.logger();
    return property.expr$.pipe(
      switchMap((expr) => {
        return this.dehydrateExpr$(expr);
      }),
      map((dehydratedExpr) => {
        logger.log("map", "dehydratedExpr", dehydratedExpr);
        const deProperty: DehydratedObjectProperty = {
          id: property.id,
          expr: dehydratedExpr,
        };
        return deProperty;
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
