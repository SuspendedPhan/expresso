import { Effect, Layer } from "effect";
import { ExObjectFocusCtx } from "src/focus/ExObjectFocusCtx";
import { ExprFocusCtx } from "src/focus/ExprFocus";
import { FocusCtx } from "src/focus/FocusCtx";

export class MainCtx extends Effect.Tag("MainCtx")<
  MainCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  yield* FocusCtx.register();
  yield* ExprFocusCtx.register();
  yield* ExObjectFocusCtx.register();

  return {};
});

export const MainCtxLive = Layer.effect(MainCtx, ctxEffect);