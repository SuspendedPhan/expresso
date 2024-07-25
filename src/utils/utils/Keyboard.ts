import hotkeys from "hotkeys-js";
import { map } from "rxjs";
import MainContext from "src/main-context/MainContext";
import { Window } from "src/main-context/MainViewContext";
import type FocusManager from "src/utils/utils/FocusManager";
import { KeyboardScope } from "./KeyboardScope";

export default class Keyboard {
  public static SCOPE = "Main";

  // private static 

  public static register(ctx: MainContext, focusManager: FocusManager) {
    hotkeys.setScope(this.SCOPE);

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

    const projectNavScope = new KeyboardScope(focusManager.getFocus$().pipe(map((focus) => focus.type === "ProjectNav")));
    projectNavScope.setChordPrefix("g");
    projectNavScope.hotkeys("e", () => {
      ctx.viewCtx.activeWindow$.next(Window.ProjectEditor);
      ctx.focusManager.focusNone();
    });

    projectNavScope.hotkeys("c", () => {
      ctx.viewCtx.activeWindow$.next(Window.ProjectComponentList);
      ctx.focusManager.focusNone()
    });

    projectNavScope.hotkeys("f", () => {
      ctx.viewCtx.activeWindow$.next(Window.ProjectFunctionList);
      ctx.focusManager.focusNone()
    });

    projectNavScope.hotkeys("l", () => {
      ctx.focusManager.focusLibraryNav();
    });

    projectNavScope.hotkeys("h", () => {
      ctx.viewCtx.navCollapsed$.next(!ctx.viewCtx.navCollapsed$.value);
      ctx.focusManager.focusNone();
    });

    const libraryNavScope = new KeyboardScope(focusManager.getFocus$().pipe(map((focus) => focus.type === "LibraryNav")));
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

    const editorScope = new KeyboardScope(ctx.viewCtx.activeWindow$.pipe(map((window) => window === Window.ProjectEditor)));
    editorScope.hotkeys("n", () => {
      ctx.focusManager.focusNewActions();
    });

    const newActionsScope = new KeyboardScope(focusManager.getFocus$().pipe(map((focus) => focus.type === "NewActions")));
    newActionsScope.hotkeys("p", () => {
      ctx.projectManager.addProjectNew();
      ctx.focusManager.focusNone();
    });

    newActionsScope.hotkeys("c", () => {
      ctx.projectMutator.addRootComponent();
      ctx.focusManager.focusNone();
    });

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
