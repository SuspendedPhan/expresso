// @ts-nocheck
import { Effect, Layer } from "effect";
import { filter, fromEvent, map, of, switchMap } from "rxjs";
import { FocusCtx } from "src/ctx/FocusCtx";
import type { DexEffectSuccess, OBS } from "src/utils/utils/Utils";

export enum KeyboardResult {
  OutOfScope,
}

export class KeyboardCtx extends Effect.Tag("KeyboardCtx")<
  KeyboardCtx,
  DexEffectSuccess<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const focusCtx = yield* FocusCtx;

  return {
    onKeydown$<T>(keys: string, data$: OBS<T | false>): OBS<T> {
      return this.onKeydown2$({ keys, data$ });
    },

    onKeydown2$<T>(data: {
      keys: string;
      data$: OBS<T | false>;
      preventDefault?: boolean;
    }): OBS<T> {
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
    },

    registerCancel: <T>(data$: OBS<T | false>) => {
      onKeydown$("Escape", data$).subscribe(() => {
        focusCtx.popFocus();
      });
    },
  };
});

export const KeyboardCtxLive = Layer.effect(KeyboardCtx, ctxEffect);
