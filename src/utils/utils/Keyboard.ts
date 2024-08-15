import hotkeys from "hotkeys-js";
import { firstValueFrom, map } from "rxjs";
import MainContext from "src/main-context/MainContext";
import { DexWindow, ViewMode } from "src/main-context/MainViewContext";
import { ExObjectFocusFuncs } from "src/utils/focus/ExObjectFocus";
import { ExprFocusFuncs } from "src/utils/focus/ExprFocus";
import { EditorFocus } from "src/utils/utils/EditorFocus";
import { FocusBase, FocusFns } from "src/utils/utils/Focus";
import type FocusManager from "src/utils/utils/FocusManager";
import {
  Focus2Kind
} from "src/utils/utils/FocusManager";
import { FocusScope, FocusScopeResult } from "src/utils/utils/FocusScope";
import { ProjectComponentListFocusFns } from "src/utils/utils/ProjectComponentListFocus";

export default class Keyboard {
  public static SCOPE = "Main";

  public static register(ctx: MainContext, focusManager: FocusManager) {
    hotkeys.setScope(this.SCOPE);
    hotkeys.filter = () => true;

    EditorFocus.register(ctx);
    ProjectComponentListFocusFns.register(ctx);
    ExObjectFocusFuncs.register(ctx);
    ExprFocusFuncs.register(ctx);

    const notEditingScope = new FocusScope(
      focusManager.isEditing$.pipe(map((isEditing) => !isEditing))
    );

    notEditingScope.hotkeys("g", () => {
      focusManager.focusProjectNav();
    });

    notEditingScope.hotkeys("v", () => {
      focusManager.focus({
        type: "Focus2",
        focus2: Focus2Kind.ViewActions({}),
      });
    });

    const isCancelableScope = new FocusScope(
      focusManager.getFocus$().pipe(
        map((focus) => {
          return FocusFns.isCancelable(focus);
        })
      )
    );
    isCancelableScope.hotkeys("Escape", () => {
      ctx.focusManager.popFocus();
    });

    const projectNavScope = new FocusScope(
      FocusFns.isFocus2Focused$(ctx, Focus2Kind.is.ProjectNav)
    );
    projectNavScope.setChordPrefix("g");
    projectNavScope.hotkeys("e", () => {
      ctx.viewCtx.activeWindow$.next(DexWindow.ProjectEditor);
      ctx.focusManager.focusNone();
    });

    projectNavScope.hotkeys("c", () => {
      ctx.viewCtx.activeWindow$.next(DexWindow.ProjectComponentList);
      ctx.focusManager.focusNone();
    });

    projectNavScope.hotkeys("f", () => {
      ctx.viewCtx.activeWindow$.next(DexWindow.ProjectFunctionList);
      ctx.focusManager.focusNone();
    });

    projectNavScope.hotkeys("l", () => {
      ctx.focusManager.focusLibraryNav();
    });

    projectNavScope.hotkeys("h", () => {
      ctx.viewCtx.navCollapsed$.next(!ctx.viewCtx.navCollapsed$.value);
      ctx.focusManager.focusNone();
    });

    const libraryNavScope = new FocusScope(
      FocusFns.isFocus2Focused$(ctx, Focus2Kind.is.LibraryNav)
    );
    libraryNavScope.hotkeys("p", () => {
      ctx.viewCtx.activeWindow$.next(DexWindow.LibraryProjectList);
      ctx.focusManager.focusNone();
    });

    libraryNavScope.hotkeys("c", () => {
      ctx.viewCtx.activeWindow$.next(DexWindow.LibraryComponentList);
      ctx.focusManager.focusNone();
    });

    libraryNavScope.hotkeys("f", () => {
      ctx.viewCtx.activeWindow$.next(DexWindow.LibraryFunctionList);
      ctx.focusManager.focusNone();
    });

    const viewActionsScope = new FocusScope(
      FocusFns.isFocus2Focused$(ctx, Focus2Kind.is.ViewActions)
    );
    viewActionsScope.hotkeys("m", () => {
      ctx.viewCtx.viewMode$.next(ViewMode.MainWindowMaximized);
      ctx.focusManager.popFocus();
      ctx.focusManager.popFocus();
    });

    viewActionsScope.hotkeys("s", () => {
      ctx.viewCtx.viewMode$.next(ViewMode.CanvasWindowMaximized);
      ctx.focusManager.popFocus();
      ctx.focusManager.popFocus();
    });

    viewActionsScope.hotkeys("r", () => {
      ctx.viewCtx.viewMode$.next(ViewMode.Default);
      ctx.focusManager.popFocus();
      ctx.focusManager.popFocus();
    });


    const editableScope = new FocusScope(
      ctx.focusManager.getFocus$().pipe(
        map((focus) => {
          if (
            focus instanceof FocusBase &&
            focus.isEditable &&
            !focus.isEditing
          ) {
            return focus;
          }
          return FocusScopeResult.OutOfScope;
        })
      )
    );

    editableScope.hotkeys("e", (focus) => {
      focus.startEditing!(ctx);
    });

    document.addEventListener("keydown", async (event: KeyboardEvent) => {
      const isEditing = await firstValueFrom(ctx.focusManager.isEditing$);
      if (isEditing) {
        return;
      }

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
