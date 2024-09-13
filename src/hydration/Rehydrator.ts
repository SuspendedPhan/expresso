import assert from "assert-ts";
import { Effect } from "effect";
import { firstValueFrom } from "rxjs";
import { ComponentCtx } from "src/ctx/ComponentCtx";
import {
  ComponentFactory,
  type Component,
  type ComponentKind,
} from "src/ex-object/Component";
import {
  ComponentParameter,
  ComponentParameterFactory,
  type ComponentParameterKind,
} from "src/ex-object/ComponentParameter";
import type { ExFunc } from "src/ex-object/ExFunc";
import type { ExFuncParameter } from "src/ex-object/ExFuncParameter";
import type { ExObject } from "src/ex-object/ExObject";
import {
  ExprFactory2,
  type Expr,
  type ExprKind,
  type ReferenceTarget,
} from "src/ex-object/Expr";
import type { LibraryProject } from "src/ex-object/LibraryProject";
import type { PropertyKind } from "src/ex-object/Property";
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

    const exFuncArr: ExFunc[] = await Promise.all(
      deProject.exFuncArr.map(rehydrateExFunc)
    );

    const customComponentArr: ComponentKind["Custom"][] = await Promise.all(
      deProject.customComponents.map(rehydrateCustomComponent)
    );

    log55.debug("rehydrateProject.customComponentArr.end", customComponentArr);

    const rootExObjects: ExObject[] = await Promise.all(
      deProject.rootExObjects.map(rehydrateExObject)
    );

    rehydrateTargets();

    const project = CreateProject.from(ctx, {
      rootExObjects,
      componentArr: customComponentArr,
      exFuncArr,
    });

    log55.debug("Project loaded", project);

    const libraryProject: LibraryProject = await createLibraryProject(ctx, {
      id: deProject.id,
      name: deProject.name,
      project,
    });

    const library = await firstValueFrom(ctx.library$);
    library.addProject(libraryProject);
    return libraryProject;
  }

  async function rehydrateTargets(): Promise<void> {
    for (const reRefExpr of rehydratedReferenceExprs) {
      const target = targetById.get(reRefExpr.dehydratedReferenceExpr.targetId);
      assert(target !== undefined);
      reRefExpr.referenceExpr.target = target;
    }
  }

  async function rehydrateExFunc(deExFunc: DehydratedExFunc): Promise<ExFunc> {
    const expr = await rehydrateExpr(deExFunc.expr);
    const exFuncParameterArr: ExFuncParameter[] = await Promise.all(
      deExFunc.parameters.map(rehydrateExFuncParameter)
    );
    return createExFunc(ctx, {
      id: deExFunc.id,
      name: deExFunc.name,
      expr,
      exFuncParameterArr,
    });
  }

  async function rehydrateExFuncParameter(
    deExFuncParameter: DehydratedExFuncParameter
  ): Promise<ExFuncParameter> {
    const parameter = await createExFuncParameter(ctx, {
      id: deExFuncParameter.id,
      name: deExFuncParameter.name,
    });
    targetById.set(parameter.id, parameter);
    return parameter;
  }

  async function rehydrateCustomComponent(
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

  async function rehydrateComponentParameter(
    deParameter: DehydratedCustomComponentParameter
  ): Promise<CustomComponentParameter> {
    const parameter = await createCustomComponentParameter(ctx, {
      id: deParameter.id,
      name: deParameter.name,
    });
    targetById.set(parameter.id, parameter);
    return parameter;
  }

  async function rehydrateExObject(
    deExObject: DehydratedExObject
  ): Promise<ExObject> {
    const component = getComponent(
      deExObject.componentId,
      deExObject.componentType
    );
    const componentPropertyL: PropertyKind["ComponentParameterProperty"][] =
      await Promise.all(
        deExObject.componentProperties.map(rehydrateComponentProperty)
      );

    const basicPropertyL: PropertyKind["BasicProperty"][] = await Promise.all(
      deExObject.basicProperties.map(rehydrateBasicProperty)
    );

    const cloneCountProperty = await rehydrateCloneCountProperty(
      deExObject.cloneProperty
    );

    const children: ExObject[] = await Promise.all(
      deExObject.children.map(rehydrateExObject)
    );

    const exObject: ExObject = await CreateExObject.blank(ctx, {
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

  async function rehydrateComponentProperty(
    deProperty: DehydratedComponentProperty
  ): Promise<PropertyKind["ComponentParameterProperty"]> {
    const parameter = getComponentParameter(
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

  async function rehydrateBasicProperty(
    deProperty: DehydratedBasicProperty
  ): Promise<PropertyKind["BasicProperty"]> {
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

  async function rehydrateCloneCountProperty(
    deProperty: DehydratedCloneCountProperty
  ): Promise<PropertyKind["CloneCountProperty"]> {
    const expr = await rehydrateExpr(deProperty.expr);
    const property = await Create.Property.cloneCount(ctx, deProperty.id, expr);

    targetById.set(property.id, property);
    return property;
  }

  async function rehydrateExpr(deExpr: DehydratedExpr): Promise<Expr> {
    const result = matcher(deExpr)
      .when(DehydratedExpr.Number, rehydrateNumberExpr)
      .when(DehydratedExpr.CallExpr, rehydrateCallExpr)
      .when(DehydratedExpr.ReferenceExpr, rehydrateReferenceExpr)
      .complete();
    return result;
  }

  async function rehydrateNumberExpr(
    deExpr: DehydratedExprKind["Number"]
  ): Promise<NumberExpr> {
    const newLocal = ctx.objectFactory.createNumberExpr(
      deExpr.value,
      deExpr.id
    );
    return newLocal;
  }

  async function rehydrateCallExpr(
    deExpr: DehydratedExprKind["CallExpr"]
  ): Promise<CallExpr> {
    const argL = await Promise.all(deExpr.args.map(rehydrateExpr));
    const callExprBase = await createCallExprBase(ctx, {
      id: deExpr.id,
      args: argL,
    });
    return createSystemCallExpr(ctx, { base: callExprBase });
  }

  function rehydrateReferenceExpr(deExpr: DehydratedExprKind["ReferenceExpr"]) {
    return Effect.gen(function* () {
      const reference: ExprKind["Reference"] = yield* ExprFactory2.Reference({
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
          return ctx.componentCtx.getCanvasComponentById(componentId);
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
