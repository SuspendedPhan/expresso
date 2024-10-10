import { Data, Effect, Layer } from "effect";


export interface GlobalProperty {
  _tag: string;
  id: string;
  eval(): number;
}

const GlobalProperty = Data.tagged<GlobalProperty>("GlobalProperty");

export class GlobalPropertyCtx extends Effect.Tag("GlobalPropertyCtx")<
  GlobalPropertyCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  return {
    globalProperties: [
      GlobalProperty({
        id: "Time",
        eval() {
          return Date.now();
        },
      }),
      GlobalProperty({
        id: "CanvasWidth",
        eval() {
          return 1000;
        },
      }),
      GlobalProperty({
        id: "CanvasHeight",
        eval() {
          return 1000;
        },
      }),
    ] as GlobalProperty[],
  };
});

export const GlobalPropertyCtxLive = Layer.effect(GlobalPropertyCtx, ctxEffect);