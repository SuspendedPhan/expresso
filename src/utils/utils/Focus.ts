import { BehaviorSubject, map } from "rxjs";
import type MainContext from "src/main-context/MainContext";
import { ExObjectFocusFuncs, ExObjectFocusKind } from "src/utils/focus/ExObjectFocus";
import { ExprFocusFuncs, ExprFocusKind } from "src/utils/focus/ExprFocus";
import { ComponentFocusKind } from "src/utils/utils/ComponentFocus";
import type { ProjectComponentListFocus } from "src/utils/utils/ProjectComponentListFocus";
import type { SUB } from "src/utils/utils/Utils";
import unionize, { ofType, type UnionOf } from "unionize";

export const FocusKind = unionize({
  None: {},
  ProjectNav: {},
  LibraryNav: {},
  EditorNewActions: {},
  ViewActions: {},
  ProjectComponentList: ofType<{ pclFocus: ProjectComponentListFocus }>(),
  ...ComponentFocusKind,
  ...ExObjectFocusKind,
  ...ExprFocusKind,
});

export type Focus = UnionOf<typeof FocusKind>;

export enum FocusKeys {
  Down = "ArrowDown,s",
}

export interface FocusContextData {
  focus$: SUB<Focus>;
}

export type FocusContext = ReturnType<typeof createFocusContext>;

export function createFocusContext(_ctx: MainContext) {
  const focusStack = new Array<Focus>();
  const data = {
    focus$: new BehaviorSubject<Focus>(FocusKind.None()),
  };
  return {
    ...data,

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
    ExObjectFocusFuncs.register(ctx);
    ExprFocusFuncs.register(ctx);

    document.addEventListener("keydown", async (event: KeyboardEvent) => {
      // todp: handle input editing
      switch (event.key) {
        case "ArrowDown":
        case "ArrowUp":
        case "ArrowLeft":
        case "ArrowRight":
          event.preventDefault();
          break;
      }
    });
  }
}
