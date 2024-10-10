import { Effect, Layer } from "effect";
import { ComponentFactory, type ComponentKind } from "src/ex-object/Component";
import { ComponentParameterFactory } from "src/ex-object/ComponentParameter";

export class CanvasComponentCtx extends Effect.Tag("CanvasComponentCtx")<
  CanvasComponentCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  return {
    canvasComponents: {
        circle: ComponentFactory.Canvas({
          id: "circle",
          parameters: [
            ComponentParameterFactory.Canvas({
              name: "x",
              id: "x",
              canvasSetter: (pixiObject, value) => {
                pixiObject.x = value;
              },
            }),
            ComponentParameterFactory.Canvas({
              name: "y",
              id: "y",
              canvasSetter: (pixiObject, value) => {
                pixiObject.y = value;
              },
            }),
            ComponentParameterFactory.Canvas({
              name: "radius",
              id: "radius",
              canvasSetter: (pixiObject, value) => {
                pixiObject.scale.set(value, value);
              },
            }),
          ],
        }),
      } satisfies Record<string, ComponentKind["Canvas"]>
  };
});

export const CanvasComponentCtxLive = Layer.effect(CanvasComponentCtx, ctxEffect);