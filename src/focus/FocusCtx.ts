import { Effect, Layer } from "effect";
import { BehaviorSubject, map } from "rxjs";
import { ExprFocus, ExprFocusCtx } from "src/focus/ExprFocus";
import { type Focus, FocusFactory } from "src/focus/Focus";
import { log5 } from "src/utils/utils/Log5";
import type { OBS } from "src/utils/utils/Utils";
import type { EditableFocus } from "src/utils/views/Field";

const log55 = log5("Focus.ts");

export enum Hotkeys {
  Down = "ArrowDown,s",
  Up = "ArrowUp,w",
  Left = "ArrowLeft,a",
  Right = "ArrowRight,d",
}

export class FocusCtx extends Effect.Tag("FocusCtx")<
  FocusCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const focus$ = new BehaviorSubject<Focus>(FocusFactory.None());
  const focusStack = new Array<Focus>();

  focus$.subscribe((focus) => {
    log55.debug("focus", focus);
  });

  return {
    focus$: focus$,

    setFocus(focus: Focus) {
      focusStack.push(focus);
      focus$.next(focus);
    },

    popFocus() {
      focusStack.pop();
      focus$.next(focusStack[focusStack.length - 1] ?? FocusFactory.None());
    },

    focusOrFalse$<T extends Focus>(
      predicate: (focus: Focus) => focus is T
    ): OBS<T | false> {
      return focus$.pipe(
        map((focus) => {
          const result = predicate(focus);
          return result === false ? false : focus;
        })
      );
    },

    mapFocus$<T>(mapperFn: (focus: Focus) => T) {
      return focus$.pipe(map(mapperFn));
    },

    editingFocus$<T extends EditableFocus>(
      predicate: (f: Focus) => f is T,
      isEditing: boolean
    ): OBS<T | false> {
      return this.focusOrFalse$(predicate).pipe(
        map((f) => {
          if (f === false) {
            return false;
          }
          const match = f.isEditing === isEditing;
          return match ? f : false;
        })
      );
    },

    register() {
      document.addEventListener("keydown", async (event: KeyboardEvent) => {
        if (event.target !== null && "tagName" in event.target) {
          if (event.target.tagName === "INPUT") {
            return;
          }
        }

        switch (event.key) {
          case Hotkeys.Down:
          case Hotkeys.Up:
          case Hotkeys.Left:
          case Hotkeys.Right:
            event.preventDefault();
            break;
        }
      });

      document.addEventListener("mousedown", async () => {
        this.popFocus();
      });
    },
  };
});

export const FocusCtxLive = Layer.effect(FocusCtx, ctxEffect);
