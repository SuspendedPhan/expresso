import { Context, Effect, Layer } from "effect";
import type { DexEffectSuccess } from "src/utils/utils/Utils";

export class KeyboardCtx extends Context.Tag("KeyboardCtx")<
  KeyboardCtx,
  DexEffectSuccess<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
    
});

export const KeyboardCtxLive = Layer.effect(
  KeyboardCtx,
  ctxEffect
);

