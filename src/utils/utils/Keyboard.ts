import hotkeys from "hotkeys-js";
import { map } from "rxjs";
import MainContext from "src/main-context/MainContext";
import { ViewMode, Window } from "src/main-context/MainViewContext";
import type FocusManager from "src/utils/utils/FocusManager";
import { KeyboardScope, KeyboardScopeResult } from "./KeyboardScope";
import { ExItemType } from "src/ex-object/ExItem";

export default class Keyboard {
  public static SCOPE = "Main";

  // private static

  public static register(ctx: MainContext, focusManager: FocusManager) {
    hotkeys.setScope(this.SCOPE);
    hotkeys.filter = () => true;

    hotkeys("down,s", this.SCOPE, function (_event, _handler) {
      focusManager.down$.next();
      return false;
    });

    hotkeys("up,w", this.SCOPE, function (_event, _handler) {
      focusManager.up$.next();
      return false;
    });

    hotkeys("left,a", this.SCOPE, function (_event, _handler) {
      focusManager.left();
      return false;
    });

    hotkeys("right,d", this.SCOPE, function (_event, _handler) {
      focusManager.right();
      return false;
    });

    hotkeys("g", function (_event, _handler) {
      focusManager.focusProjectNav();
    });

    hotkeys("v", function (_event, _handler) {
      focusManager.focusViewActions();
    });

    const projectNavScope = new KeyboardScope(
      focusManager.getFocus$().pipe(map((focus) => focus.type === "ProjectNav"))
    );
    projectNavScope.setChordPrefix("g");
    projectNavScope.hotkeys("e", () => {
      ctx.viewCtx.activeWindow$.next(Window.ProjectEditor);
      ctx.focusManager.focusNone();
    });

    projectNavScope.hotkeys("c", () => {
      ctx.viewCtx.activeWindow$.next(Window.ProjectComponentList);
      ctx.focusManager.focusNone();
    });

    projectNavScope.hotkeys("f", () => {
      ctx.viewCtx.activeWindow$.next(Window.ProjectFunctionList);
      ctx.focusManager.focusNone();
    });

    projectNavScope.hotkeys("l", () => {
      ctx.focusManager.focusLibraryNav();
    });

    projectNavScope.hotkeys("h", () => {
      ctx.viewCtx.navCollapsed$.next(!ctx.viewCtx.navCollapsed$.value);
      ctx.focusManager.focusNone();
    });

    projectNavScope.hotkeys("Esc", () => {
      ctx.focusManager.popFocus();
    });

    const libraryNavScope = new KeyboardScope(
      focusManager.getFocus$().pipe(map((focus) => focus.type === "LibraryNav"))
    );
    libraryNavScope.hotkeys("p", () => {
      ctx.viewCtx.activeWindow$.next(Window.LibraryProjectList);
      ctx.focusManager.focusNone();
    });

    libraryNavScope.hotkeys("c", () => {
      ctx.viewCtx.activeWindow$.next(Window.LibraryComponentList);
      ctx.focusManager.focusNone();
    });

    libraryNavScope.hotkeys("f", () => {
      ctx.viewCtx.activeWindow$.next(Window.LibraryFunctionList);
      ctx.focusManager.focusNone();
    });

    libraryNavScope.hotkeys("Esc", () => {
      ctx.focusManager.popFocus();
      ctx.focusManager.popFocus();
    });

    const editorScope = new KeyboardScope(
      ctx.viewCtx.activeWindow$.pipe(
        map((window) => window === Window.ProjectEditor)
      )
    );
    editorScope.hotkeys("n", () => {
      ctx.focusManager.focusNewActions();
    });

    const newActionsScope = new KeyboardScope(
      focusManager.getFocus$().pipe(map((focus) => focus.type === "NewActions"))
    );
    newActionsScope.hotkeys("p", () => {
      ctx.projectManager.addProjectNew();
      ctx.focusManager.focusNone();
    });

    newActionsScope.hotkeys("c", () => {
      ctx.projectMutator.addRootObject();
      ctx.focusManager.focusNone();
    });

    newActionsScope.hotkeys("Esc", () => {
      ctx.focusManager.popFocus();
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
      focusManager.getFocus$().pipe(map((focus) => focus.type === "ViewActions"))
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
        map((focus) => focus.type === "ExItem" && focus.exItem.itemType === ExItemType.Property)
      )
    );
    propertyScope.hotkeys("e", () => {

    document.addEventListener("keydown", (event) => {
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
