import hotkeys from "hotkeys-js";
import { firstValueFrom, map } from "rxjs";
import { ExItemType } from "src/ex-object/ExItem";
import MainContext from "src/main-context/MainContext";
import { ViewMode, DexWindow } from "src/main-context/MainViewContext";
import { FocusBase, FocusFns } from "src/utils/utils/Focus";
import type FocusManager from "src/utils/utils/FocusManager";
import {
  Focus2Union,
  type EditPropertyNameFocus,
} from "src/utils/utils/FocusManager";
import { KeyboardScope, KeyboardScopeResult } from "./KeyboardScope";
import { EditorFocus } from "src/utils/utils/EditorFocus";

export default class Keyboard {
  public static SCOPE = "Main";

  // private static

  public static register(ctx: MainContext, focusManager: FocusManager) {
    hotkeys.setScope(this.SCOPE);
    hotkeys.filter = () => true;

    EditorFocus.register(ctx);

    const notEditingScope = new KeyboardScope(
      focusManager.isEditing$.pipe(map((isEditing) => !isEditing))
    );

    notEditingScope.hotkeys("ArrowDown,s", () => {
      focusManager.down$.next();
    });

    notEditingScope.hotkeys("ArrowUp,w", () => {
      focusManager.up$.next();
    });

    notEditingScope.hotkeys("ArrowLeft,a", () => {
      focusManager.left();
    });

    notEditingScope.hotkeys("ArrowRight,d", () => {
      focusManager.right();
    });

    notEditingScope.hotkeys("g", () => {
      focusManager.focusProjectNav();
    });

    notEditingScope.hotkeys("v", () => {
      focusManager.focus({
        type: "Focus2",
        focus2: Focus2Union.ViewActions({}),
      });
    });

    const isCancelableScope = new KeyboardScope(
      focusManager.getFocus$().pipe(
        map((focus) => {
          if (focus instanceof FocusBase) {
            return focus.isCancelable;
          }
          if (
            focus.type === "ExprReplaceCommand" ||
            (focus.type === "Focus2" &&
              Focus2Union.is.EditorNewActions(focus.focus2))
          ) {
            return true;
          }
          return false;
        })
      )
    );
    isCancelableScope.hotkeys("Escape", () => {
      ctx.focusManager.popFocus();
    });

    const projectNavScope = new KeyboardScope(
      FocusFns.isFocus2Focused$(ctx, Focus2Union.is.ProjectNav)
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

    const libraryNavScope = new KeyboardScope(
      FocusFns.isFocus2Focused$(ctx, Focus2Union.is.LibraryNav)
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

    const focusedExpr$ = ctx.focusManager.getFocus$().pipe(
      map((focus) => {
        if (
          focus.type !== "ExItem" ||
          focus.exItem.itemType !== ExItemType.Expr
        ) {
          return KeyboardScopeResult.OutOfScope;
        }
        return focus.exItem;
      })
    );

    const exprScope = new KeyboardScope(focusedExpr$);
    exprScope.hotkeys("e", (expr) => {
      ctx.focusManager.focusExprReplaceCommand(expr);
    });

    const exprReplaceCommand$ = ctx.focusManager.getFocus$().pipe(
      map((focus) => {
        if (focus.type === "ExprReplaceCommand") {
          return focus;
        }
        return KeyboardScopeResult.OutOfScope;
      })
    );
    const exprReplaceCommandScope = new KeyboardScope(exprReplaceCommand$);
    exprReplaceCommandScope.hotkeys("Esc", (focus) => {
      ctx.focusManager.focusExItem(focus.expr);
    });

    exprReplaceCommandScope.hotkeys("Enter", () => {
      ctx.eventBus.submitExprReplaceCommand$.next();
    });

    const viewActionsScope = new KeyboardScope(
      FocusFns.isFocus2Focused$(ctx, Focus2Union.is.ViewActions)
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

    const propertyScope = new KeyboardScope(
      ctx.focusManager.getFocus$().pipe(
        map((focus) => {
          if (
            focus.type === "ExItem" &&
            focus.exItem.itemType === ExItemType.Property
          ) {
            return focus.exItem;
          }
          return KeyboardScopeResult.OutOfScope;
        })
      )
    );
    propertyScope.hotkeys("e", (property) => {
      const focus: EditPropertyNameFocus = {
        type: "EditPropertyName",
        property,
      };
      ctx.focusManager.focus(focus);
    });

    const editableScope = new KeyboardScope(
      ctx.focusManager.getFocus$().pipe(
        map((focus) => {
          if (
            focus instanceof FocusBase &&
            focus.isEditable &&
            !focus.isEditing
          ) {
            return focus;
          }
          return KeyboardScopeResult.OutOfScope;
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
