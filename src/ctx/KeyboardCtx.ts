import { Effect, Layer } from "effect";
import {
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  of,
  switchMap,
  tap,
} from "rxjs";
import type { Focus } from "src/focus/Focus";
import { FocusCtx } from "src/focus/FocusCtx";
import { log5 } from "src/utils/utils/Log5";
import { RxFns, type DexEffectSuccess, type OBS } from "src/utils/utils/Utils";
import type { EditableFocus } from "src/utils/views/Field";

const log55 = log5("KeyboardCtx.ts");

interface RegisterEditArgs<T extends EditableFocus> {
  focusIsFn: (focus: Focus) => focus is T;
  createEditingFocusFn: (isEditing: boolean) => Focus;
  filterFn(focus: T): boolean;
}

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
        tap((data) => {
          log55.log3(9, "onKeydown2$.data", data);
        }),
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

    registerCancel<T>(data$: OBS<T | false>) {
      this.onKeydown$(
        "Escape",
        data$.pipe(distinctUntilChanged<T | false>())
      ).subscribe(() => {
        focusCtx.popFocus();
      });
    },

    registerEditKey<T extends EditableFocus>(args: RegisterEditArgs<T>) {
      return Effect.gen(this, function* () {
        const notEditingFocus$ = focusCtx
          .editingFocus$(args.focusIsFn, false)
          .pipe(RxFns.getOrFalse((f) => args.filterFn(f)));

        this.onKeydown2$({
          keys: "e",
          data$: notEditingFocus$,
          preventDefault: true,
        }).subscribe(() => {
          log55.debug("edit");
          focusCtx.setFocus(args.createEditingFocusFn(true));
        });
      });
    },
  };
});

export const KeyboardCtxLive = Layer.effect(KeyboardCtx, ctxEffect);
