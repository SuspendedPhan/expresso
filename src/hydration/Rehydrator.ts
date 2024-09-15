import assert from "assert-ts";
import { Effect } from "effect";
import { ComponentCtx } from "src/ctx/ComponentCtx";
import type { ExObjectCtx } from "src/ctx/ExObjectCtx";
import type { ExprCtx } from "src/ctx/ExprCtx";
import { LibraryCtx } from "src/ctx/LibraryCtx";
import type { LibraryProjectCtx } from "src/ctx/LibraryProjectCtx";
import type { PropertyCtx } from "src/ctx/PropertyCtx";
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
import { CustomExFuncFactory2 } from "src/ex-object/ExFunc";
import { ExFuncParameterFactory2 } from "src/ex-object/ExFuncParameter";
import { ExObject, ExObjectFactory2 } from "src/ex-object/ExObject";
import {
  ExprFactory2,
  type Expr,
  type ExprKind,
  type ReferenceTarget,
} from "src/ex-object/Expr";
import { LibraryProjectFactory2 } from "src/ex-object/LibraryProject";
import { Project, ProjectFactory2 } from "src/ex-object/Project";
import { PropertyFactory2, type PropertyKind } from "src/ex-object/Property";
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

interface RehydratedComponentParameterProperty {
  property: PropertyKind["ComponentParameterProperty"];
  dehydratedProperty: DehydratedComponentProperty;
}

export default function createRehydrator() {
  const customComponentById = new Map<string, ComponentKind["Custom"]>();
  const rehydratedReferenceExprs: RehydratedReferenceExpr[] = [];
  const rehydratedComponentParameterProperties: RehydratedComponentParameterProperty[] =
    [];
  const targetById = new Map<string, ReferenceTarget>();
  const componentParameterById = new Map<
    string,
    ComponentParameterKind["Custom"]
  >();

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

      yield* assignTargets();
      yield* assignComponentParameters();

      const project: Project = yield* ProjectFactory2({
        id: deProject.id,
        rootExObjects,
        components: customComponentArr,
        exFuncs: exFuncArr,
      });

      log55.debug("Project loaded", project);

      const libraryProject = yield* LibraryProjectFactory2({
        id: deProject.id,
        name: deProject.name,
        project,
      });

      const library = yield* LibraryCtx.library;
      library.libraryProjects.push(libraryProject);

      return libraryProject;
    });
  }

  function assignTargets() {
    return Effect.gen(function* () {
      for (const reRefExpr of rehydratedReferenceExprs) {
        const target = targetById.get(
          reRefExpr.dehydratedReferenceExpr.targetId
        );
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

  function rehydrateExFunc(deExFunc: DehydratedExFunc) {
    return Effect.gen(function* () {
      const expr = yield* rehydrateExpr(deExFunc.expr);
      const exFuncParameterArr = yield* Effect.all(
        deExFunc.parameters.map(rehydrateExFuncParameter)
      );
      return yield* CustomExFuncFactory2.Custom({
        id: deExFunc.id,
        name: deExFunc.name,
        expr,
        exFuncParameterArr,
      });
    });
  }

  function rehydrateExFuncParameter(
    deExFuncParameter: DehydratedExFuncParameter
  ) {
    return Effect.gen(function* () {
      const parameter = yield* ExFuncParameterFactory2({
        id: deExFuncParameter.id,
        name: deExFuncParameter.name,
      });
      targetById.set(parameter.id, parameter);
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

      const rootExObjectArr = yield* Effect.all(
        deCustomComponent.rootExObjects.map(rehydrateExObject)
      );

      const component = yield* ComponentFactory2.Custom({
        id: deCustomComponent.id,
        name: deCustomComponent.name,
        parameters: parameterArr,
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
    ExprCtx | ComponentCtx | PropertyCtx | ExObjectCtx | LibraryProjectCtx
  > {
    const effect = Effect.gen(function* () {
      const component = yield* getComponent(
        deExObject.componentId,
        deExObject.componentType
      );

      const componentPropertyL = yield* Effect.all(
        deExObject.componentProperties.map(rehydrateComponentProperty)
      );

      const basicPropertyL = yield* Effect.all(
        deExObject.basicProperties.map(rehydrateBasicProperty)
      );

      const cloneCountProperty = yield* rehydrateCloneCountProperty(
        deExObject.cloneProperty
      );

      const children = yield* Effect.all(
        deExObject.children.map(rehydrateExObject)
      );

      const exObject: ExObject = yield* ExObjectFactory2({
        component,
        id: deExObject.id,
        name: deExObject.name,
        componentProperties: componentPropertyL,
        basicProperties: basicPropertyL,
        cloneCountProperty,
        children,
      });

      return exObject;
    });
    return effect;
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
    rehydrateProject,
  };
}
