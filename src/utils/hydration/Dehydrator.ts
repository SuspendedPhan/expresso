import {
  combineLatest,
  combineLatestWith,
  map,
  type Observable,
  of,
  switchMap
} from "rxjs";
import { ComponentType } from "src/ex-object/Component";
import {
  type CallExpr,
  type Expr,
  ExprType,
  type NumberExpr,
} from "src/ex-object/ExItem";
import type { ExObject } from "src/ex-object/ExObject";
import type { Project } from "src/ex-object/Project";
import {
  type BasicProperty,
  type CloneCountProperty,
  type ComponentParameterProperty,
} from "src/ex-object/Property";
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
  name: string;
  componentId: string;
  componentType: string;
  componentProperties: DehydratedComponentProperty[];
  basicProperties: DehydratedBasicProperty[];
  cloneProperty: DehydratedCloneCountProperty;
  children: DehydratedExObject[];
}

export interface DehydratedComponentProperty {
  id: string;
  componentParameterId: string;
  expr: DehydratedExpr;
}

export interface DehydratedBasicProperty {
  id: string;
  name: string;
  expr: DehydratedExpr;
}

export interface DehydratedCloneCountProperty {
  id: string;
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

    const deComponentProperties$ = combineLatest(
      exObject.componentParameterProperties.map((property) =>
        this.dehydrateComponentProperty$(property)
      )
    );

    const deBasicProperties$ = exObject.basicProperties$.pipe(
      switchMap((properties) => {
        const newLocal = properties.map((property) =>
          this.dehydrateBasicProperty$(property)
        );

        return combineLatest(newLocal);
      })
    );

    const deCloneProperty$ = this.dehydrateCloneProperty$(
      exObject.cloneCountProperty
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

    const result = combineLatest([
      deComponentProperties$,
      deBasicProperties$,
      deCloneProperty$,
      deChildren$,
      exObject.name$,
    ]).pipe(
      map(
        ([
          deComponentProperties,
          deBasicProperties,
          deCloneProperty,
          deChildren,
          name
        ]) => {
          const deExObject: DehydratedExObject = {
            id: exObject.id,
            name,
            componentId: exObject.component.id,
            componentType: ComponentType[exObject.component.componentType],
            componentProperties: deComponentProperties,
            basicProperties: deBasicProperties,
            cloneProperty: deCloneProperty,
            children: deChildren,
          };
          return deExObject;
        }
      )
    );

    return result;
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
          componentParameterId: property.componentParameter.id,
          expr: dehydratedExpr,
        };
        return deProperty;
      })
    );
  }

  @loggedMethod
  public dehydrateBasicProperty$(
    property: BasicProperty
  ): Observable<DehydratedBasicProperty> {
    const logger = Logger.logger();
    return property.expr$.pipe(
      switchMap((expr) => {
        return this.dehydrateExpr$(expr);
      }),
      combineLatestWith(property.name$),
      map(([dehydratedExpr, name]) => {
        logger.log("map", "dehydratedExpr", dehydratedExpr);
        const deProperty: DehydratedBasicProperty = {
          id: property.id,
          name,
          expr: dehydratedExpr,
        };
        return deProperty;
      })
    );
  }

  @loggedMethod
  public dehydrateCloneProperty$(
    property: CloneCountProperty
  ): Observable<DehydratedCloneCountProperty> {
    const logger = Logger.logger();
    return property.expr$.pipe(
      switchMap((expr) => {
        return this.dehydrateExpr$(expr);
      }),
      map((dehydratedExpr) => {
        logger.log("map", "dehydratedExpr", dehydratedExpr);
        const deProperty: DehydratedCloneCountProperty = {
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
