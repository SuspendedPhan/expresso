import { Effect, Layer } from "effect";

export interface GlobalProperty {
  id: string;
  eval(): number;
}

export class GlobalPropertyCtx extends Effect.Tag("GlobalPropertyCtx")<
  GlobalPropertyCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  return {
    globalProperties: [] as GlobalProperty[],
  };
});

export const GlobalPropertyCtxLive = Layer.effect(GlobalPropertyCtx, ctxEffect);