import { Effect, Layer } from "effect";
import { BehaviorSubject, map } from "rxjs";
import { type Focus, FocusFactory } from "src/focus/Focus";
import type { OBS } from "src/utils/utils/Utils";

// const log55 = log5("Focus.ts");

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

    register() {
      // EditorFocusFuncs.register(ctx);
      // ExObjectFocusFuncs.register(ctx);
      // ExprFocusFuncs.register(ctx);
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
