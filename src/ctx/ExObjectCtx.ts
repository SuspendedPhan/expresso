import { Effect, Layer } from "effect";

export class ExObjectCtx extends Effect.Tag("ExObjectCtx")<
  ExObjectCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
    return {
        // exObjects: createObservableArrayWithLifetime<ExObject>(new Subject<void>()),
    }
});

export const ExObjectCtxLive = Layer.effect(
  ExObjectCtx,
  ctxEffect
);

