import { Effect, Layer } from "effect";
import type { ExObject } from "src/ex-object/ExObject";
import { FocusCtx, FocusCtxLive } from "src/focus/FocusCtx";
import type { OBS } from "src/utils/utils/Utils";

export class ExObjectFocusCtx extends Effect.Tag("ExObjectFocusCtx")<
  ExObjectFocusCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const focusCtx = yield* FocusCtx;
  return {
    mapExObjectFocus$(
      focusKindCheck: (obj: any) => boolean
    ): OBS<ExObject | false> {
      return focusCtx.mapFocus$((focus) => {
        if (!focusKindCheck(focus)) {
          return false;
        }
        return (focus as any).exObject;
      });
    },
  };
});

export const ExObjectFocusCtxLive = Layer.effect(ExObjectFocusCtx, ctxEffect);