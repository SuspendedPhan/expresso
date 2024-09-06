import { Context, Layer, Effect } from "effect";
import { KeyboardCtx } from "src/ctx/KeyboardCtx";
import type { DexEffectSuccess } from "src/utils/utils/Utils";

export class EditorFocusCtx extends Context.Tag("EditorFocusCtx")<
  EditorFocusCtx,
  DexEffectSuccess<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
    const keyboardCtx = yield* KeyboardCtx;

    return {
        register() {

        }
    };
});

export const EditorFocusCtxLive = Layer.effect(
  EditorFocusCtx,
  ctxEffect
);

