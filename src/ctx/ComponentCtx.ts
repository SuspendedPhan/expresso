import { Effect, Layer, Stream } from "effect";
import { CanvasComponentCtx } from "src/ctx/CanvasComponentCtx";
import { ComponentFactory, type Component, type ComponentKind } from "src/ex-object/Component";
import type { ComponentParameterKind } from "src/ex-object/ComponentParameter";
import { log5 } from "src/utils/utils/Log5";
import type { DexEffectSuccess } from "src/utils/utils/Utils";
import { matcher } from "variant";

const log55 = log5("ComponentCtx.ts");

export class ComponentCtx extends Effect.Tag("ComponentCtx")<
  ComponentCtx,
  DexEffectSuccess<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const canvasComponentCtx = yield* CanvasComponentCtx;
  const canvasComponents = canvasComponentCtx.canvasComponents;

  const parameterById = new Map<string, ComponentParameterKind["Canvas"]>();
  canvasComponents.circle.parameters.forEach((parameter) => {
    parameterById.set(parameter.id, parameter);
  });

  return {
    getCanvasComponentById(id: string) {
      const component: ComponentKind["Canvas"] = (canvasComponents as any)[id];
      if (!component) {
        throw new Error(`Canvas component not found: ${id}`);
      }
      return component;
    },

    getCanvasComponentParameterById(id: string) {
      const parameter = parameterById.get(id);
      log55.debug("getCanvasComponentParameterById", id, parameter);

      if (!parameter) {
        throw new Error(`Canvas component parameter not found: ${id}`);
      }
      return parameter;
    },

    getName(component: Component): Stream.Stream<string> {
      return matcher(component)
        .when(ComponentFactory.Canvas, (c) => Stream.make(c.id))
        .when(ComponentFactory.Custom, (c) => c.name)
        .complete();
    }
  };
});

export const ComponentCtxLive = Layer.effect(ComponentCtx, ctxEffect);
