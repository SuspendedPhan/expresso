import { Data, Effect, Layer, Ref } from "effect";


export interface GlobalProperty {
  _tag: string;
  id: string;
  eval(): Effect.Effect<number>;
}

const GlobalProperty = Data.tagged<GlobalProperty>("GlobalProperty");

export class GlobalPropertyCtx extends Effect.Tag("GlobalPropertyCtx")<
  GlobalPropertyCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const canvasWidth = yield* Ref.make(1000);
  const canvasHeight = yield* Ref.make(1000);

  return {
    canvasWidth,
    canvasHeight,

    globalProperties: [
      GlobalProperty({
        id: "Time",
        eval() {
          return Effect.succeed(Date.now());
        },
      }),
      GlobalProperty({
        id: "CanvasWidth",
        eval() {
          return canvasWidth.get;
        },
      }),
      GlobalProperty({
        id: "CanvasHeight",
        eval() {
          return canvasHeight.get;
        },
      }),
    ] as GlobalProperty[],
  };
});

export const GlobalPropertyCtxLive = Layer.effect(GlobalPropertyCtx, ctxEffect);