import { Context, Effect, Layer } from "effect";
import { FocusCtx } from "src/ctx/FocusCtx";
import type { ExObject } from "src/ex-object/ExObject";
import type { OBS } from "src/utils/utils/Utils";

export class ExObjectFocusCtx extends Context.Tag("ExObjectFocusCtx")<
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

    getProperties(exObject: ExObject) {
      const basicProperties = await firstValueFrom(exObject.basicProperties);
      yield exObject.cloneCountProperty;
      for (const property of exObject.componentParameterProperties) {
        yield property;
      }
      for (const property of basicProperties) {
        yield property;
      }
    },
  };
});

export const ExObjectFocusCtxLive = Layer.effect(ExObjectFocusCtx, ctxEffect);
