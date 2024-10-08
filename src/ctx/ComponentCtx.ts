import { Effect, Layer, Stream } from "effect";
import { CanvasComponentCtx } from "src/ctx/CanvasComponentCtx";
import {
  ComponentFactory,
  type Component,
  type ComponentKind,
} from "src/ex-object/Component";
import {
  ComponentParameterFactory2,
  type ComponentParameterKind,
} from "src/ex-object/ComponentParameter";
import { ExItem } from "src/ex-object/ExItem";
import { PropertyFactory2 } from "src/ex-object/Property";
import { EffectUtils } from "src/utils/utils/EffectUtils";
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
    },

    addParameterBlank(component: ComponentKind["Custom"]) {
      return Effect.gen(function* () {
        const parameter = yield* ComponentParameterFactory2.Custom({});
        yield* component.parameters.push(parameter);
        parameter.parent$.next(component);

        // Create a parameter property for all exobjects who use this component.
        const project = yield* ExItem.getProject3(component).pipe(
          Stream.unwrap,
          EffectUtils.getFirstOrThrow
        );
        for (const exObject of project.exObjects.items) {
          const other = yield* exObject.component.get;
          if (other === component) {
            const property = yield* PropertyFactory2.ComponentParameterProperty(
              {
                parameter,
              }
            );
            yield* exObject.componentParameterProperties_.push(property);
          }
        }
        return parameter;
      });
    },

    addPropertyBlank(component: ComponentKind["Custom"]) {
      return Effect.gen(function* () {
        const property = yield* PropertyFactory2.BasicProperty({});
        yield* component.properties.push(property);
        property.parent$.next(component);
        return property;
      });
    },
  };
});

export const ComponentCtxLive = Layer.effect(ComponentCtx, ctxEffect);
