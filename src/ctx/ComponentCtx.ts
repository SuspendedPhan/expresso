import { Effect, Layer } from "effect";
import { CanvasComponentStore, type ComponentKind } from "src/ex-object/Component";
import type { ComponentParameterKind } from "src/ex-object/ComponentParameter";
import { log5 } from "src/utils/utils/Log5";
import type { DexEffectSuccess } from "src/utils/utils/Utils";

const log55 = log5("ComponentCtx.ts");

export class ComponentCtx extends Effect.Tag("ComponentCtx")<
  ComponentCtx,
  DexEffectSuccess<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const parameterById = new Map<string, ComponentParameterKind["Canvas"]>();
  CanvasComponentStore.circle.parameters.forEach((parameter) => {
    parameterById.set(parameter.id, parameter);
  });

  return {
    getCanvasComponentById(id: string) {
      const component: ComponentKind["Canvas"] = (CanvasComponentStore as any)[id];
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
  };
});

export const ComponentCtxLive = Layer.effect(ComponentCtx, ctxEffect);
