import assert from "assert-ts";
import { Effect, Layer } from "effect";
import { ComponentCtx } from "src/ctx/ComponentCtx";
import type { EventBusCtx } from "src/ctx/EventBusCtx";
import { LibraryProjectCtx } from "src/ctx/LibraryProjectCtx";
import {
  CloneNumberTargetCtx,
  CloneNumberTargetFactory,
  type CloneNumberTarget,
} from "src/ex-object/CloneNumberTarget";
import {
  ComponentFactory,
  ComponentFactory2,
  type ComponentKind,
} from "src/ex-object/Component";
import {
  ComponentParameterFactory,
  ComponentParameterFactory2,
  type ComponentParameterKind,
} from "src/ex-object/ComponentParameter";
import {
  CustomExFuncFactory,
  CustomExFuncFactory2,
  SystemExFuncFactory,
  type CustomExFunc,
} from "src/ex-object/ExFunc";
import { ExFuncParameterFactory2 } from "src/ex-object/ExFuncParameter";
import { ExObject, ExObjectFactory2 } from "src/ex-object/ExObject";
import {
  ExprFactory2,
  type Expr,
  type ExprKind,
  type ReferenceTarget,
} from "src/ex-object/Expr";
import {
  LibraryProject,
  LibraryProjectFactory2,
} from "src/ex-object/LibraryProject";
import { Project, ProjectFactory2 } from "src/ex-object/Project";
import { PropertyFactory2, type PropertyKind } from "src/ex-object/Property";
import {
  DehydratedExpr,
  type DehydratedBasicProperty,
  type DehydratedCloneCountProperty,
  type DehydratedCloneNumberTarget,
  type DehydratedComponentProperty,
  type DehydratedCustomComponent,
  type DehydratedCustomComponentParameter,
  type DehydratedExFunc,
  type DehydratedExFuncParameter,
  type DehydratedExObject,
  type DehydratedExprKind,
  type DehydratedLibraryProject,
  type DehydratedProject,
} from "src/hydration/Dehydrator";

import { log5 } from "src/utils/utils/Log5";
import { matcher, type TypesOf } from "variant";

const log55 = log5("RehydratorCtx.ts");

interface RehydratedReferenceExpr {
  referenceExpr: ExprKind["Reference"];
  dehydratedReferenceExpr: DehydratedExprKind["ReferenceExpr"];
}

interface RehydratedComponentParameterProperty {
  property: PropertyKind["ComponentParameterProperty"];
  dehydratedProperty: DehydratedComponentProperty;
}

interface RehydratedCallExpr {
  callExpr: ExprKind["Call"];
  dehydratedCallExpr: DehydratedExprKind["CallExpr"];
}

export class RehydratorCtx extends Effect.Tag("RehydratorCtx")<
  RehydratorCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const cloneNumberTargetCtx = yield* CloneNumberTargetCtx;

  const customComponentById = new Map<string, ComponentKind["Custom"]>();
  const rehydratedReferenceExprs: RehydratedReferenceExpr[] = [];
  const rehydratedComponentParameterProperties: RehydratedComponentParameterProperty[] =
    [];
  const rehydratedCallExprs = new Map<string, RehydratedCallExpr>();
  const targetById = new Map<string, ReferenceTarget>();
  const componentParameterById = new Map<
    string,
    ComponentParameterKind["Custom"]
  >();
  const customExFuncById = new Map<string, CustomExFunc>();

  function rehydrateLibraryProject(deProject: DehydratedLibraryProject) {
    return Effect.gen(function* () {
      const project = yield* rehydrateProject(deProject.project);
      const libraryProject: LibraryProject = yield* LibraryProjectFactory2({
        id: deProject.libraryProjectId,
        name: deProject.name,
        project,
      });
      return libraryProject;
    });
  }

  function rehydrateProject(deProject: DehydratedProject) {
    return Effect.gen(function* () {
      log55.debug("rehydrateProject.start", deProject);

      const exFuncArr = yield* Effect.all(
        deProject.exFuncArr.map(rehydrateExFunc)
      );

      const customComponentArr = yield* Effect.all(
        deProject.customComponents.map(rehydrateCustomComponent)
      );

      log55.debug(
        "rehydrateProject.customComponentArr.end",
        customComponentArr
      );

      const rootExObjects = yield* Effect.all(
        deProject.rootExObjects.map(rehydrateExObject)
      );

      log55.debug("rehydrateProject.rootExObjects.end", rootExObjects);

      yield* assignTargets();
      yield* assignComponentParameters();
      yield* assignExFuncs();

      log55.debug("rehydrateProject.assign.end");

      const project: Project = yield* ProjectFactory2({
        id: deProject.id,
        rootExObjects,
        components: customComponentArr,
        exFuncs: exFuncArr,
      });

      log55.debug("rehydrateProject.end", project);

      return project;
    });
  }

  function assignTargets() {
    return Effect.gen(function* () {
      for (const reRefExpr of rehydratedReferenceExprs) {
        const targetId = reRefExpr.dehydratedReferenceExpr.targetId;
        assert(targetId !== null);
        const target = targetById.get(targetId);
        assert(target !== undefined);
        reRefExpr.referenceExpr.target = target;
      }
    });
  }

  function assignComponentParameters() {
    return Effect.gen(function* () {
      for (const reProp of rehydratedComponentParameterProperties) {
        const parameter = yield* getComponentParameter(
          reProp.dehydratedProperty.componentParameterId,
          reProp.dehydratedProperty.componentParameterKind
        );
        assert(parameter !== undefined);
        reProp.property.componentParameter = parameter;
      }
    });
  }

  function assignExFuncs() {
    return Effect.gen(function* () {
      for (const reCallExpr of rehydratedCallExprs.values()) {
        if (
          reCallExpr.dehydratedCallExpr.exFuncKind ===
          CustomExFuncFactory.output.type
        ) {
          const { exFuncId } = reCallExpr.dehydratedCallExpr;
          assert(exFuncId !== null);
          const exFunc = customExFuncById.get(exFuncId);
          assert(exFunc !== undefined);
          reCallExpr.callExpr.exFunc$.next(exFunc);
        } else {
          const systemExFuncKind = reCallExpr.dehydratedCallExpr.exFuncKind;
          const factory = SystemExFuncFactory[systemExFuncKind];
          const exFunc = factory();
          reCallExpr.callExpr.exFunc$.next(exFunc);
        }
      }
    });
  }

  function rehydrateExFunc(deExFunc: DehydratedExFunc) {
    return Effect.gen(function* () {
      log55.debug("rehydrateExFunc.start", deExFunc);

      const expr = yield* rehydrateExpr(deExFunc.expr);

      log55.debug("rehydrateExFunc.expr", expr);

      const exFuncParameterArr = yield* Effect.all(
        deExFunc.parameters.map(rehydrateExFuncParameter)
      );

      log55.debug("rehydrateExFunc.exFuncParameterArr", exFuncParameterArr);

      const exFunc = yield* CustomExFuncFactory2.Custom({
        id: deExFunc.id,
        name: deExFunc.name,
        expr,
        exFuncParameterArr,
      });
      customExFuncById.set(exFunc.id, exFunc);

      log55.debug("rehydrateExFunc.end", exFunc);
      return exFunc;
    });
  }

  function rehydrateExFuncParameter(
    deExFuncParameter: DehydratedExFuncParameter
  ) {
    return Effect.gen(function* () {
      log55.debug("rehydrateExFuncParameter.start", deExFuncParameter);
      const parameter = yield* ExFuncParameterFactory2({
        id: deExFuncParameter.id,
        name: deExFuncParameter.name,
      });
      targetById.set(parameter.id, parameter);

      log55.debug("rehydrateExFuncParameter.end", parameter);
      return parameter;
    });
  }

  function rehydrateCustomComponent(
    deCustomComponent: DehydratedCustomComponent
  ) {
    return Effect.gen(function* () {
      const parameterArr = yield* Effect.all(
        deCustomComponent.parameters.map(rehydrateComponentParameter)
      );

      const propertyArr = yield* Effect.all(
        deCustomComponent.properties.map(rehydrateBasicProperty)
      );

      const rootExObjectArr = yield* Effect.all(
        deCustomComponent.rootExObjects.map(rehydrateExObject)
      );

      const component = yield* ComponentFactory2.Custom({
        id: deCustomComponent.id,
        name: deCustomComponent.name,
        parameters: parameterArr,
        properties: propertyArr,
        rootExObjects: rootExObjectArr,
      });

      customComponentById.set(component.id, component);
      return component;
    });
  }

  function rehydrateComponentParameter(
    deParameter: DehydratedCustomComponentParameter
  ) {
    return Effect.gen(function* () {
      const parameter = yield* ComponentParameterFactory2.Custom({
        id: deParameter.id,
        name: deParameter.name,
      });
      targetById.set(parameter.id, parameter);
      componentParameterById.set(parameter.id, parameter);
      return parameter;
    });
  }

  function rehydrateExObject(
    deExObject: DehydratedExObject
  ): Effect.Effect<
    ExObject,
    never,
    ComponentCtx | LibraryProjectCtx | EventBusCtx | CloneNumberTargetCtx
  > {
    const effect = Effect.gen(function* () {
      log55.debug("rehydrateExObject.start", deExObject);

      const component = yield* getComponent(
        deExObject.componentId,
        deExObject.componentType
      );

      log55.debug("rehydrateExObject.component", component);

      const componentPropertyL = yield* Effect.all(
        deExObject.componentProperties.map(rehydrateComponentProperty)
      );

      log55.debug("rehydrateExObject.componentPropertyL", componentPropertyL);

      const basicPropertyL = yield* Effect.all(
        deExObject.basicProperties.map(rehydrateBasicProperty)
      );

      log55.debug("rehydrateExObject.basicPropertyL", basicPropertyL);

      const cloneCountProperty = yield* rehydrateCloneCountProperty(
        deExObject.cloneProperty
      );

      log55.debug("rehydrateExObject.cloneCountProperty", cloneCountProperty);

      const children = yield* Effect.all(
        deExObject.children.map(rehydrateExObject)
      );

      log55.debug("rehydrateExObject.children", children);

      const cloneNumberTarget = yield* rehydrateCloneNumberTarget(
        deExObject.cloneNumberTarget
      );

      const exObject: ExObject = yield* ExObjectFactory2({
        component,
        id: deExObject.id,
        name: deExObject.name,
        componentProperties: componentPropertyL,
        basicProperties: basicPropertyL,
        cloneCountProperty,
        children,
        cloneNumberTarget,
      });

      log55.debug("rehydrateExObject.end", exObject);
      return exObject;
    });
    return effect;
  }

  function rehydrateCloneNumberTarget(
    deCloneNumberTarget: DehydratedCloneNumberTarget
  ) {
    return Effect.gen(function* () {
      const target: CloneNumberTarget = yield* cloneNumberTargetCtx.create({
        id: deCloneNumberTarget.id,
      });
      targetById.set(target.id, target);
      return target;
    });
  }

  function rehydrateComponentProperty(deProperty: DehydratedComponentProperty) {
    return Effect.gen(function* () {
      const expr = yield* rehydrateExpr(deProperty.expr);
      const property = yield* PropertyFactory2.ComponentParameterProperty({
        id: deProperty.id,
        expr,
      });
      targetById.set(property.id, property);
      rehydratedComponentParameterProperties.push({
        property,
        dehydratedProperty: deProperty,
      });
      return property;
    });
  }

  function rehydrateBasicProperty(deProperty: DehydratedBasicProperty) {
    return Effect.gen(function* () {
      const expr = yield* rehydrateExpr(deProperty.expr);
      const property = yield* PropertyFactory2.BasicProperty({
        id: deProperty.id,
        name: deProperty.name,
        expr,
      });
      targetById.set(property.id, property);
      return property;
    });
  }

  function rehydrateCloneCountProperty(
    deProperty: DehydratedCloneCountProperty
  ) {
    return Effect.gen(function* () {
      const expr = yield* rehydrateExpr(deProperty.expr);
      const property = yield* PropertyFactory2.CloneCountProperty({
        id: deProperty.id,
        expr,
      });
      targetById.set(property.id, property);
      return property;
    });
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
  ): Effect.Effect<ExprKind["Call"], never, EventBusCtx> {
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
      rehydratedCallExprs.set(expr.id, {
        callExpr: expr,
        dehydratedCallExpr: deExpr,
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
      const id = deExpr.targetId;
      assert(id !== null);
      return reference;
    });
  }

  function getComponent(
    componentId: string,
    componentType: TypesOf<typeof ComponentFactory>
  ) {
    return Effect.gen(function* () {
      switch (componentType) {
        case ComponentFactory.Custom.output.type: {
          const component = customComponentById.get(componentId);
          assert(
            component !== undefined,
            `Component not found: ${componentId} ${componentType}`
          );
          return component;
        }
        case ComponentFactory.Canvas.output.type: {
          const component = yield* ComponentCtx.getCanvasComponentById(
            componentId
          );
          return component;
        }
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
          const parameter = componentParameterById.get(parameterId);
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
    rehydrateLibraryProject,
    rehydrateProject,
  };
});

export const RehydratorCtxLive = Layer.effect(RehydratorCtx, ctxEffect);
