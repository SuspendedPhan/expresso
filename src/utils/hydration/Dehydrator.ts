import {
  combineLatest,
  combineLatestWith,
  map,
  type Observable,
  of,
  switchMap,
  tap
} from "rxjs";
import { ComponentKind, ComponentParameterKind, type CustomComponent, type CustomComponentParameter } from "src/ex-object/Component";
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
import { log5 } from "src/utils/utils/Log2";
import { assertUnreachable, RxFns } from "src/utils/utils/Utils";

const log55 = log5("Dehydrator.ts");

export type DehydratedExpr = DehydratedNumberExpr | DehydratedCallExpr;

export interface DehydratedProject {
  id: string;
  name: string;
  rootExObjects: DehydratedExObject[];
  customComponents: DehydratedCustomComponent[];
}

export interface DehydratedCustomComponent {
  id: string;
  name: string;
  parameters: DehydratedCustomComponentParameter[];
  rootExObjects: DehydratedExObject[];
}

export interface DehydratedCustomComponentParameter {
  id: string;
  name: string;
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
  componentParameterKind: ComponentParameterKind;
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
      log55.tapDebug("dehydrateProject$.exObjects.start"),
      switchMap((exObjects) => {
        log55.debug("dehydrateProject$.exObjects", exObjects);
        if (exObjects.length === 0) {
          return of([]);
        }

        return RxFns.combineLatestOrEmpty(
          exObjects.map((exObject) => {
            return this.dehydrateExObject$(exObject);
          })
        );
      }),
      log55.tapDebug("dehydrateProject$.exObjects.end")
    );

    const deComponents$ = project.componentArr$.pipe(
      switchMap((components) => {
        return RxFns.combineLatestOrEmpty(
          components.map((component) => {
            return this.dehydrateCustomComponent$(component);
          })
        );
      })
    );

    return combineLatest([deExObjects$, deComponents$]).pipe(
      log55.tapDebug("dehydrateProject$.combineLatest.start"),
      map(([deExObjects, deComponents]) => {
        return {
          id: project.libraryProject!.id,
          name: project.libraryProject!.name,
          rootExObjects: deExObjects,
          customComponents: deComponents,
        };
      }),
      tap((deProject) => {
        log55.debug("dehydrateProject$.end", deProject);
      })
    );
  }

  public dehydrateCustomComponent$(component: CustomComponent) {
    const deParameters$ = component.parameters$.pipe(
      switchMap((parameters) => {
        return RxFns.combineLatestOrEmpty(
          parameters.map((parameter) => {
            return this.dehydrateCustomComponentParameter$(parameter);
          })
        );
      })
    );

    const deRootExObjects$ = component.rootExObjects$.pipe(
      switchMap((rootExObjects) => {
        return combineLatest(
          rootExObjects.map((exObject) => {
            return this.dehydrateExObject$(exObject);
          })
        );
      })
    );

    return combineLatest([deParameters$, deRootExObjects$, component.name$]).pipe(
      map(([deParameters, deRootExObjects, name]) => {
        return {
          id: component.id,
          name,
          parameters: deParameters,
          rootExObjects: deRootExObjects,
        };
      })
    );
  }

  public dehydrateCustomComponentParameter$(
    parameter: CustomComponentParameter
  ): Observable<DehydratedCustomComponentParameter> {
    return parameter.name$.pipe(
      map((name) => {
        return {
          id: parameter.id,
          name,
        };
      })
    );
  }
  

  @loggedMethod
  public dehydrateExObject$(
    exObject: ExObject
  ): Observable<DehydratedExObject> {
    const logger = Logger.logger();

    const deComponentProperties$ = RxFns.combineLatestOrEmpty(
      exObject.componentParameterProperties.map((property) =>
        this.dehydrateComponentProperty$(property)
      )
    );

    const deBasicProperties$ = exObject.basicProperties$.pipe(
      switchMap((properties) => {
        const deProperties = properties.map((property) =>
          this.dehydrateBasicProperty$(property)
        );
        return RxFns.combineLatestOrEmpty(deProperties);
      }),
      log55.tapDebug("dehydrateExObject$.deBasicProperties$.combineLatest.end")
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
      }),
      log55.tapDebug("dehydrateExObject$.deChildren$.combineLatest.end")
    );

    const result = combineLatest([
      deComponentProperties$,
      deBasicProperties$,
      deCloneProperty$,
      deChildren$,
      exObject.name$,
    ]).pipe(
      log55.tapDebug("dehydrateExObject$.combineLatest.start"),
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
            componentType: ComponentKind[exObject.component.componentKind],
            componentProperties: deComponentProperties,
            basicProperties: deBasicProperties,
            cloneProperty: deCloneProperty,
            children: deChildren,
          };
          return deExObject;
        }
      ),
      log55.tapDebug("dehydrateExObject$.combineLatest.end")
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
          componentParameterKind: property.componentParameter.componentParameterKind,
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
    log55.debug("dehydrateBasicProperty$", property);
    const logger = Logger.logger();
    return property.expr$.pipe(
      log55.tapDebug("dehydrateBasicProperty$.expr$.start"),
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
      }),
      log55.tapDebug("dehydrateBasicProperty$.expr$.end")
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
