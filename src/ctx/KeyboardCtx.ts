import { Context, Effect, Layer } from "effect";
import { switchMap, of, fromEvent, filter, map } from "rxjs";
import { FocusCtx } from "src/ctx/FocusCtx";
import type { DexEffectSuccess, OBS } from "src/utils/utils/Utils";

export enum KeyboardResult {
  OutOfScope,
}

export class KeyboardCtx extends Context.Tag("KeyboardCtx")<
  KeyboardCtx,
  DexEffectSuccess<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const focusCtx = yield* FocusCtx;

  function onKeydown$<T>(keys: string, data$: OBS<T | false>) {
    return onKeydown2$({ keys, data$ });
  }

  function onKeydown2$<T>(data: {
    keys: string;
    data$: OBS<T | false>;
    preventDefault?: boolean;
  }) {
    const { keys, data$, preventDefault = false } = data;
    
    const keyArr = keys.split(",");

    return data$.pipe(
      switchMap((data) => {
        if (data === false) {
          return of();
        }

        return fromEvent<KeyboardEvent>(window, "keydown").pipe(
          filter((event) => {
            const matches = keyArr.includes(event.key);
            if (matches) {
              if (preventDefault) {
                event.preventDefault();
              }
            }
            return matches;
          }),
          map(() => data)
        );
      })
    );
  }

  return {
    onKeydown$,
    onKeydown2$,
    registerCancel: <T>(data$: OBS<T | false>) => {
      onKeydown$("Escape", data$).subscribe(() => {
        focusCtx.popFocus();
      });
    },
  };
});

export const KeyboardCtxLive = Layer.effect(
  KeyboardCtx,
  ctxEffect
);

