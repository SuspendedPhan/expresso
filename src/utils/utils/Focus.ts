import { BehaviorSubject, map } from "rxjs";
import type MainContext from "src/main-context/MainContext";
import { ExObjectFocusFuncs, ExObjectFocusKind } from "src/utils/focus/ExObjectFocus";
import { ExprFocusFuncs, ExprFocusKind } from "src/utils/focus/ExprFocus";
import { ComponentFocusKind } from "src/utils/utils/ComponentFocus";
import { EditorFocusFuncs, EditorFocusKind } from "src/utils/utils/EditorFocus";
import type { SUB } from "src/utils/utils/Utils";
import unionize, { type UnionOf } from "unionize";

export const FocusKind = unionize({
  None: {},
  ProjectNav: {},
  LibraryNav: {},
  ViewActions: {},
  ...EditorFocusKind,
  ...ComponentFocusKind,
  ...ExObjectFocusKind,
  ...ExprFocusKind,
});

export type Focus = UnionOf<typeof FocusKind>;

export enum Hotkeys {
  Down = "ArrowDown,s",
  Up = "ArrowUp,w",
  Left = "ArrowLeft,a",
  Right = "ArrowRight,d",
}

export interface FocusContextData {
  focus$: SUB<Focus>;
}

export type FocusContext = ReturnType<typeof createFocusContext>;

export function createFocusContext(ctx: MainContext) {
  const focusStack = new Array<Focus>();
  const data = {
    focus$: new BehaviorSubject<Focus>(FocusKind.None()),
    exprFocusCtx: ExprFocusFuncs.createContext(ctx),
  };
  return {
    ...data,

    popFocus() {
      focusStack.pop();
      data.focus$.next(focusStack[focusStack.length - 1] ?? FocusKind.None());
    },

    mapFocus$<T>(mapperFn: (focus: Focus) => T) {
      return data.focus$.pipe(map(mapperFn));
    },

    setFocus(focus: Focus) {
      focusStack.push(focus);
      data.focus$.next(focus);
    },
  };
}

export namespace FocusFns {
  export function register(ctx: MainContext) {
    EditorFocusFuncs.register(ctx);
    ExObjectFocusFuncs.register(ctx);
    ExprFocusFuncs.register(ctx);

    document.addEventListener("keydown", async (event: KeyboardEvent) => {
      if (event.target !== null && "tagName" in event.target) {
        if (event.target.tagName === "INPUT") {
          return;
        }
      }

      console.log("keydown", event.key);
      
      

      switch (event.key) {
        case "ArrowDown":
        case "ArrowUp":
        case "ArrowLeft":
        case "ArrowRight":
          event.preventDefault();
          break;
      }
    });

    document.addEventListener("mousedown", async () => {
      ctx.focusCtx.setFocus(FocusKind.None());
    });
  }
}
