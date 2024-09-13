import assert from "assert-ts";
import { Effect } from "effect";
import { firstValueFrom } from "rxjs";
import { ComponentCtx } from "src/ctx/ComponentCtx";
import type { ExprCtx } from "src/ctx/ExprCtx";
import { ComponentFactory, type ComponentKind } from "src/ex-object/Component";
import { ComponentParameterFactory } from "src/ex-object/ComponentParameter";
import type { ExFuncParameter } from "src/ex-object/ExFuncParameter";
import type { ExObject } from "src/ex-object/ExObject";
import {
  ExprFactory2,
  type Expr,
  type ExprKind,
  type ReferenceTarget,
} from "src/ex-object/Expr";
import {
  DehydratedExpr,
  type DehydratedBasicProperty,
  type DehydratedCloneCountProperty,
  type DehydratedComponentProperty,
  type DehydratedCustomComponent,
  type DehydratedCustomComponentParameter,
  type DehydratedExFunc,
  type DehydratedExFuncParameter,
  type DehydratedExObject,
  type DehydratedExprKind,
  type DehydratedProject,
} from "src/hydration/Dehydrator";

import { log5 } from "src/utils/utils/Log5";
import { matcher, type TypesOf } from "variant";

const log55 = log5("Rehydrator.ts");

interface RehydratedReferenceExpr {
  referenceExpr: ExprKind["Reference"];
  dehydratedReferenceExpr: DehydratedExprKind["ReferenceExpr"];
}

export default function createRehydrator() {
  const customComponentById = new Map<string, ComponentKind["Custom"]>();
  const rehydratedReferenceExprs: RehydratedReferenceExpr[] = [];
  const targetById = new Map<string, ReferenceTarget>();

  function rehydrateProject(deProject: DehydratedProject) {
    log55.debug("rehydrateProject.start", deProject);

    const exFuncArr = await Promise.all(
      deProject.exFuncArr.map(rehydrateExFunc)
    );

    const customComponentArr = await Promise.all(
      deProject.customComponents.map(rehydrateCustomComponent)
    );

    log55.debug("rehydrateProject.customComponentArr.end", customComponentArr);

    const rootExObjects = await Promise.all(
      deProject.rootExObjects.map(rehydrateExObject)
    );

    await rehydrateTargets();

    const project = CreateProject.from(ctx, {
      rootExObjects,
      componentArr: customComponentArr,
      exFuncArr,
    });

    log55.debug("Project loaded", project);

    const libraryProject = await createLibraryProject(ctx, {
      id: deProject.id,
      name: deProject.name,
      project,
    });

    const library = await firstValueFrom(ctx.library$);
    library.addProject(libraryProject);
    return libraryProject;
  }

  function rehydrateTargets() {
    for (const reRefExpr of rehydratedReferenceExprs) {
      const target = targetById.get(reRefExpr.dehydratedReferenceExpr.targetId);
      assert(target !== undefined);
      reRefExpr.referenceExpr.target = target;
    }
  }

  function rehydrateExFunc(deExFunc: DehydratedExFunc) {
    const expr = await rehydrateExpr(deExFunc.expr);
    const exFuncParameterArr = await Promise.all(
      deExFunc.parameters.map(rehydrateExFuncParameter)
    );
    return createExFunc(ctx, {
      id: deExFunc.id,
      name: deExFunc.name,
      expr,
      exFuncParameterArr,
    });
  }

  function rehydrateExFuncParameter(
    deExFuncParameter: DehydratedExFuncParameter
  ): Promise<ExFuncParameter> {
    const parameter = await createExFuncParameter(ctx, {
      id: deExFuncParameter.id,
      name: deExFuncParameter.name,
    });
    targetById.set(parameter.id, parameter);
    return parameter;
  }

  function rehydrateCustomComponent(
    deCustomComponent: DehydratedCustomComponent
  ): Promise<CustomComponent> {
    const parameterArr: CustomComponentParameter[] = await Promise.all(
      deCustomComponent.parameters.map(rehydrateComponentParameter)
    );

    const rootExObjectArr: ExObject[] = await Promise.all(
      deCustomComponent.rootExObjects.map(rehydrateExObject)
    );

    const component = await CreateComponent.custom(ctx, {
      id: deCustomComponent.id,
      name: deCustomComponent.name,
      parameters: parameterArr,
      rootExObjects: rootExObjectArr,
    });

    customComponentById.set(component.id, component);
    return component;
  }

  function rehydrateComponentParameter(
    deParameter: DehydratedCustomComponentParameter
  ) {
    const parameter = await createCustomComponentParameter(ctx, {
      id: deParameter.id,
      name: deParameter.name,
    });
    targetById.set(parameter.id, parameter);
    return parameter;
  }

  function rehydrateExObject(deExObject: DehydratedExObject) {
    const component = await getComponent(
      deExObject.componentId,
      deExObject.componentType
    );
    const componentPropertyL = await Promise.all(
      deExObject.componentProperties.map(rehydrateComponentProperty)
    );

    const basicPropertyL = await Promise.all(
      deExObject.basicProperties.map(rehydrateBasicProperty)
    );

    const cloneCountProperty = await rehydrateCloneCountProperty(
      deExObject.cloneProperty
    );

    const children = await Promise.all(
      deExObject.children.map(rehydrateExObject)
    );

    const exObject = await CreateExObject.blank(ctx, {
      component,
      id: deExObject.id,
      name: deExObject.name,
      componentProperties: componentPropertyL,
      basicProperties: basicPropertyL,
      cloneCountProperty,
      children,
    });

    return exObject;
  }

  function rehydrateComponentProperty(
    deProperty: DehydratedComponentProperty
  ) {
    const parameter = await getComponentParameter(
      deProperty.componentParameterId,
      deProperty.componentParameterKind
    );

    const expr = await rehydrateExpr(deProperty.expr);
    const property = await Create.Property.component(
      ctx,
      deProperty.id,
      parameter,
      expr
    );

    return property;
  }

  function rehydrateBasicProperty(deProperty: DehydratedBasicProperty) {
    const expr = await rehydrateExpr(deProperty.expr);
    const property = await Create.Property.basic(
      ctx,
      deProperty.id,
      deProperty.name,
      expr
    );

    targetById.set(property.id, property);
    return property;
  }

  function rehydrateCloneCountProperty(
    deProperty: DehydratedCloneCountProperty
  ) {
    const expr = await rehydrateExpr(deProperty.expr);
    const property = await Create.Property.cloneCount(ctx, deProperty.id, expr);

    targetById.set(property.id, property);
    return property;
  }

  function rehydrateExpr(deExpr: DehydratedExpr) {
    return Effect.gen(function* () {
      const result = matcher(deExpr)
        .when(DehydratedExpr.Number, (deExpr) => {
          return rehydrateNumberExpr(deExpr);
        })
        .when(DehydratedExpr.CallExpr, (deExpr) => {
          return rehydrateCallExpr(deExpr);
        })
        .when(DehydratedExpr.ReferenceExpr, (deExpr) => {
          return rehydrateReferenceExpr(deExpr);
        })
        .complete();
      return yield* result;
    });
  }

  function rehydrateNumberExpr(deExpr: DehydratedExprKind["Number"]) {
    return Effect.gen(function* () {
      const expr = yield* ExprFactory2.Number({
        id: deExpr.id,
        value: deExpr.value,
      });
      return expr;
    });
  }

  function rehydrateCallExpr(
    deExpr: DehydratedExprKind["CallExpr"]
  ): Effect.Effect<ExprKind["Call"], never, ExprCtx> {
    return Effect.gen(function* () {
      let args = new Array<Expr>();
      for (const deArg of deExpr.args) {
        const arg = yield* rehydrateExpr(deArg);
        args.push(arg);
      }

      const expr = yield* ExprFactory2.Call({
        id: deExpr.id,
        args,
      });
      return expr;
    });
  }

  function rehydrateReferenceExpr(deExpr: DehydratedExprKind["ReferenceExpr"]) {
    return Effect.gen(function* () {
      const reference = yield* ExprFactory2.Reference({
        id: deExpr.id,
        target: null,
      });
      rehydratedReferenceExprs.push({
        referenceExpr: reference,
        dehydratedReferenceExpr: deExpr,
      });
      return reference;
    });
  }

  function getComponent(
    componentId: string,
    componentType: TypesOf<typeof ComponentFactory>
  ) {
    return Effect.gen(function* () {
      switch (componentType) {
        case ComponentFactory.Custom.output.type:
          const component = customComponentById.get(componentId);
          assert(
            component !== undefined,
            `Component not found: ${componentId} ${componentType}`
          );
          return component;
        case ComponentFactory.Canvas.output.type:
          return yield* ComponentCtx.getCanvasComponentById(componentId);
        default:
          throw new Error(`Unknown component type: ${componentType}`);
      }
    });
  }

  function getComponentParameter(
    parameterId: string,
    parameterKind: TypesOf<typeof ComponentParameterFactory>
  ) {
    return Effect.gen(function* () {
      switch (parameterKind) {
        case ComponentParameterFactory.Canvas.output.type:
          return yield* ComponentCtx.getCanvasComponentParameterById(
            parameterId
          );
        case ComponentParameterFactory.Custom.output.type:
          const parameter = customComponentById.get(parameterId);
          assert(
            parameter !== undefined,
            `Component parameter not found: ${parameterId} ${parameterKind}`
          );
          return parameter;
        default:
          throw new Error(`Unknown component parameter type: ${parameterKind}`);
      }
    });
  }

  return {
    rehydrateProject,
    rehydrateExFunc,
    rehydrateExFuncParameter,
    rehydrateCustomComponent,
    rehydrateComponentParameter,
    rehydrateExObject,
    rehydrateComponentProperty,
    rehydrateBasicProperty,
    rehydrateCloneCountProperty,
  };
}
