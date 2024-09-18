import { Effect, Layer } from "effect";

export class EncodeCtx extends Effect.Tag("EncodeCtx")<
  EncodeCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  return {
    decode<T>(json: string): Effect.Effect<T> {
      return Effect.gen(function* () {
        return JSON.parse(json) as T;
      });
    },

    encode<T>(value: T): Effect.Effect<string> {
      return Effect.gen(function* () {
        return JSON.stringify(value);
      });
    }
  };
});

export const EncodeCtxLive = Layer.effect(EncodeCtx, ctxEffect);