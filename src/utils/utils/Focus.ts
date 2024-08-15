import { map } from "rxjs";
import type MainContext from "src/main-context/MainContext";
import { ExObjectFocusKind } from "src/utils/focus/ExObjectFocus";
import { ExprFocusKind } from "src/utils/focus/ExprFocus";
import { ComponentFocusKind } from "src/utils/utils/ComponentFocus";
import { type Focus2, Focus2Kind } from "src/utils/utils/FocusManager";
import type { ProjectComponentListFocus } from "src/utils/utils/ProjectComponentListFocus";
import type { OBS } from "src/utils/utils/Utils";
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

export namespace FocusFns {
  export function register(_ctx: MainContext) {
    document.addEventListener("keydown", async (event: KeyboardEvent) => {
      // const isEditing = await firstValueFrom(ctx.focusManager.isEditing$);
      // if (isEditing) {
      //   return;
      // }

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

  export function getFocus$(ctx: MainContext): OBS<Focus> {
    return ctx.focusManager.getFocus$();
  }

  export function focus(ctx: MainContext, focus2: Focus2) {
    ctx.focusManager.focus({ type: "Focus2", focus2 });
  }

  export function isFocus2Focused$(
    ctx: MainContext,
    predicate: (focus2: Focus2) => boolean
  ): OBS<boolean> {
    return ctx.focusManager.getFocus$().pipe(
      map((focus) => {
        return focus.type === "Focus2" && predicate(focus.focus2);
      })
    );
  }

  export function isNoneFocused$(ctx: MainContext): OBS<boolean> {
    return ctx.focusManager.getFocus$().pipe(
      map((focus) => {
        return focus.type === "Focus2" && Focus2Kind.is.None(focus.focus2);
      })
    );
  }
}
