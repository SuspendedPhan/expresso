import assert from "assert-ts";
import {
  combineLatest,
  combineLatestWith,
  map,
  of,
  switchMap,
  tap,
  type Observable
} from "rxjs";
import type { ComponentFactory, ComponentKind } from "src/ex-object/Component";
import type {
  ComponentParameterFactory,
  ComponentParameterKind,
} from "src/ex-object/ComponentParameter";
import { CustomExFuncFactory, type CustomExFunc, type SystemExFuncFactory } from "src/ex-object/ExFunc";
import type { ExFuncParameter } from "src/ex-object/ExFuncParameter";
import type { ExObject } from "src/ex-object/ExObject";
import { ExprFactory, type Expr, type ExprKind } from "src/ex-object/Expr";
import type { Project } from "src/ex-object/Project";
import type { PropertyKind } from "src/ex-object/Property";
import Logger from "src/utils/logger/Logger";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";
import { log5 } from "src/utils/utils/Log5";
import { RxFns } from "src/utils/utils/Utils";
import {
  type DexVariantKind,
  type DexVariantUnion,
} from "src/utils/utils/VariantUtils4";
import { descope, matcher, scoped, typed, type TypesOf, type VariantOf } from "variant";
import { pass } from "variant/lib/typed";

const log55 = log5("Dehydrator.ts");

type DehydratedExpr_ = {
  Number: {
    id: string;
    value: number;
  };
  CallExpr: {
    id: string;
    args: DehydratedExpr[];
    exFuncKind: typeof CustomExFuncFactory.output.type | keyof typeof SystemExFuncFactory;
    exFuncId: string | null;
  };
  ReferenceExpr: {
    id: string;
    targetId: string;
  };
};

export const DehydratedExpr = scoped(
  "DehydratedExpr",
  typed<DexVariantUnion<DehydratedExpr_>>({
    Number: pass,
    CallExpr: pass,
    ReferenceExpr: pass,
  })
);
export type DehydratedExpr = VariantOf<typeof DehydratedExpr>;
export type DehydratedExprKind = DexVariantKind<typeof DehydratedExpr>;

export interface DehydratedProject {
  id: string;
  name: string;
  rootExObjects: DehydratedExObject[];
  customComponents: DehydratedCustomComponent[];
  exFuncArr: DehydratedExFunc[];
}

export interface DehydratedExFunc {
  id: string;
  name: string;
  parameters: DehydratedExFuncParameter[];
  expr: DehydratedExpr;
}

export interface DehydratedExFuncParameter {
  id: string;
  name: string;
}

export interface DehydratedCustomComponent {
  id: string;
  name: string;
  parameters: DehydratedCustomComponentParameter[];
  properties: DehydratedBasicProperty[];
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
  componentType: TypesOf<typeof ComponentFactory>;
  componentProperties: DehydratedComponentProperty[];
  basicProperties: DehydratedBasicProperty[];
  cloneProperty: DehydratedCloneCountProperty;
  children: DehydratedExObject[];
}

export interface DehydratedComponentProperty {
  id: string;
  componentParameterKind: TypesOf<typeof ComponentParameterFactory>;
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

export default class Dehydrator {
  public dehydrateProject$(project: Project): Observable<DehydratedProject> {
    const deExObjects$ = project.rootExObjects.items$.pipe(
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

    const deComponents$ = project.components.items$.pipe(
      switchMap((components) => {
        return RxFns.combineLatestOrEmpty(
          components.map((component) => {
            return this.dehydrateCustomComponent$(component);
          })
        );
      })
    );

    const deExFuncs$ = project.exFuncs.items$.pipe(
      switchMap((exFuncs) => {
        return RxFns.combineLatestOrEmpty(
          exFuncs.map((exFunc) => {
            return this.dehydrateExFunc$(exFunc);
          })
        );
      })
    );

    const deProject$ = combineLatest([
      deExObjects$,
      deComponents$,
      deExFuncs$,
    ]).pipe(
      log55.tapDebug("dehydrateProject$.combineLatest.start"),
      map(([deExObjects, deComponents, deExFuncs]) => {
        const deProject: DehydratedProject = {
          id: project.libraryProject!.id,
          name: project.libraryProject!.name,
          rootExObjects: deExObjects,
          customComponents: deComponents,
          exFuncArr: deExFuncs,
        };
        return deProject;
      }),
      tap((deProject) => {
        log55.debug("dehydrateProject$.end", deProject);
      })
    );
    return deProject$;
  }

  public dehydrateExFunc$(exFunc: CustomExFunc): Observable<DehydratedExFunc> {
    const deParameters$ = exFunc.parameters.items$.pipe(
      switchMap((parameters) => {
        return RxFns.combineLatestOrEmpty(
          parameters.map((parameter) => {
            return this.dehydrateExFuncParameter$(parameter);
          })
        );
      })
    );

    const deExpr$ = exFunc.expr$.pipe(
      switchMap((expr) => {
        return this.dehydrateExpr$(expr);
      })
    );

    return combineLatest([deParameters$, deExpr$, exFunc.name$]).pipe(
      map(([deParameters, deExpr, name]) => {
        return {
          id: exFunc.id,
          name,
          parameters: deParameters,
          expr: deExpr,
        };
      })
    );
  }

  public dehydrateExFuncParameter$(
    parameter: ExFuncParameter
  ): Observable<DehydratedExFuncParameter> {
    return parameter.name$.pipe(
      map((name) => {
        return {
          id: parameter.id,
          name,
        };
      })
    );
  }

  public dehydrateCustomComponent$(component: ComponentKind["Custom"]) {
    log55.debug("dehydrateCustomComponent$", component);
    const deParameters$ = component.parameters.items$.pipe(
      switchMap((parameters) => {
        log55.debug("dehydrateCustomComponent$.parameters", parameters);
        return RxFns.combineLatestOrEmpty(
          parameters.map((parameter) => {
            return this.dehydrateCustomComponentParameter$(parameter);
          })
        );
      })
    );

    const deProperties$ = component.properties.items$.pipe(
      switchMap((properties) => {
        return RxFns.combineLatestOrEmpty(
          properties.map((property) => {
            return this.dehydrateBasicProperty$(property);
          })
        );
      })
    );

    const deRootExObjects$ = component.rootExObjects.items$.pipe(
      switchMap((rootExObjects) => {
        log55.debug("dehydrateCustomComponent$.rootExObjects", rootExObjects);
        return RxFns.combineLatestOrEmpty(
          rootExObjects.map((exObject) => {
            return this.dehydrateExObject$(exObject);
          })
        );
      })
    );

    return combineLatest([
      deParameters$,
      deRootExObjects$,
      deProperties$,
      component.name$,
    ]).pipe(
      map(([deParameters, deRootExObjects, deProperties, name]) => {
        log55.debug("dehydrateCustomComponent$.combineLatest");
        const deComponent: DehydratedCustomComponent = {
          id: component.id,
          name,
          parameters: deParameters,
          properties: deProperties,
          rootExObjects: deRootExObjects,
        };
        return deComponent;
      })
    );
  }

  public dehydrateCustomComponentParameter$(
    parameter: ComponentParameterKind["Custom"]
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

    const deBasicProperties$ = exObject.basicProperties.items$.pipe(
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
          name,
        ]) => {
          const deExObject: DehydratedExObject = {
            id: exObject.id,
            name,
            componentId: exObject.component.id,
            componentType: exObject.component.type,
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
    property: PropertyKind["ComponentParameterProperty"]
  ): Observable<DehydratedComponentProperty> {
    const logger = Logger.logger();
    return property.expr$.pipe(
      switchMap((expr) => {
        return this.dehydrateExpr$(expr);
      }),
      map((dehydratedExpr) => {
        logger.log("map", "dehydratedExpr", dehydratedExpr);
        const { componentParameter } = property;
        assert(componentParameter != null);
        const deProperty: DehydratedComponentProperty = {
          id: property.id,
          componentParameterId: componentParameter.id,
          componentParameterKind: componentParameter.type,
          expr: dehydratedExpr,
        };
        return deProperty;
      })
    );
  }

  @loggedMethod
  public dehydrateBasicProperty$(
    property: PropertyKind["BasicProperty"]
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
    property: PropertyKind["CloneCountProperty"]
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
    return matcher(expr)
      .when(ExprFactory.Number, (expr) => this.dehydrateNumberExpr$(expr))
      .when(ExprFactory.Call, (expr) => this.dehydrateCallExpr$(expr))
      .when(ExprFactory.Reference, (expr) => this.dehydrateReferenceExpr$(expr))
      .complete();
  }

  private dehydrateNumberExpr$(
    expr: ExprKind["Number"]
  ): Observable<DehydratedExprKind["Number"]> {
    return of(
      DehydratedExpr.Number({
        id: expr.id,
        value: expr.value,
      })
    );
  }

  private dehydrateCallExpr$(
    expr: ExprKind["Call"]
  ): Observable<DehydratedExprKind["CallExpr"]> {
    const deArgs$ = expr.args$.pipe(
      switchMap((args) => {
        return this.dehydrateArgs$(args);
      })
    );

    const result: Observable<DehydratedExprKind["CallExpr"]> = combineLatest([expr.exFunc$, deArgs$]).pipe(
      map(([exFunc, deArgs]) => {
        assert(exFunc != null);

        let exFuncKind: DehydratedExprKind["CallExpr"]["exFuncKind"];
        if (exFunc.type === CustomExFuncFactory.output.type) {
          exFuncKind = CustomExFuncFactory.output.type;
        } else {
          log55.debug("exFunc", exFunc);
          const vv = descope(exFunc);
          log55.debug("vv", vv);
          exFuncKind = vv.type;
        }

        return DehydratedExpr.CallExpr({
          id: expr.id,
          args: deArgs,
          exFuncKind,
          exFuncId: exFunc.type === CustomExFuncFactory.output.type ? exFunc.id : null,
        });
      })
    )

    return result;
  }

  private dehydrateReferenceExpr$(
    expr: ExprKind["Reference"]
  ): Observable<DehydratedExprKind["ReferenceExpr"]> {
    log55.debug(expr.target);

    const target = expr.target;
    assert(target != null);
    return of(
      DehydratedExpr.ReferenceExpr({
        id: expr.id,
        targetId: target.id,
      })
    );
  }

  private dehydrateArgs$(args: readonly Expr[]): Observable<DehydratedExpr[]> {
    return combineLatest(args.map((arg) => this.dehydrateExpr$(arg)));
  }
}
