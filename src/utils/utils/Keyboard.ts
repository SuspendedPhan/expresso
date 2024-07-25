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

    hotkeys("down", this.SCOPE, function (_event, _handler) {
      focusManager.down$.next();
      return false;
    });

    hotkeys("up", this.SCOPE, function (_event, _handler) {
      focusManager.up$.next();
      return false;
    });

    hotkeys("left", this.SCOPE, function (_event, _handler) {
      focusManager.left();
      return false;
    });

    hotkeys("right", this.SCOPE, function (_event, _handler) {
      focusManager.right();
      return false;
    });

    // document.addEventListener("mousedown", (e: KeyboardEvent) => {
    //   // switch (e.key)
    // });
    hotkeys("g", function (_event, _handler) {
      focusManager.focus({ type: "ProjectNav" });
    });

    // hotkeys("g+e", function (_event, _handler) {
    //   ctx.viewCtx.activeWindow$.next(Window.ProjectEditor);
    // });

    // hotkeys("g+c", function (_event, _handler) {
    //   ctx.viewCtx.activeWindow$.next(Window.ProjectComponentList);
    // });

    const projectNavScope = new KeyboardScope(focusManager.getFocus$().pipe(map((focus) => focus.type === "ProjectNav")));
    projectNavScope.setChordPrefix("g");
    projectNavScope.hotkeys("e", () => {
      ctx.viewCtx.activeWindow$.next(Window.ProjectEditor);
      ctx.focusManager.focus({ type: "None" });
    });

    projectNavScope.hotkeys("c", () => {
      ctx.viewCtx.activeWindow$.next(Window.ProjectComponentList);
      ctx.focusManager.focus({ type: "None" });
    });

    projectNavScope.hotkeys("f", () => {
      ctx.viewCtx.activeWindow$.next(Window.ProjectFunctionList);
      ctx.focusManager.focus({ type: "None" });
    });

    projectNavScope.hotkeys("l", () => {
      ctx.focusManager.focus({ type: "LibraryNav" });
    });

    const libraryNavScope = new KeyboardScope(focusManager.getFocus$().pipe(map((focus) => focus.type === "LibraryNav")));
    libraryNavScope.hotkeys("p", () => {
      ctx.viewCtx.activeWindow$.next(Window.LibraryProjectList);
      ctx.focusManager.focus({ type: "None" });
    });

    libraryNavScope.hotkeys("c", () => {
      ctx.viewCtx.activeWindow$.next(Window.LibraryComponentList);
      ctx.focusManager.focus({ type: "None" });
    });

    libraryNavScope.hotkeys("f", () => {
      ctx.viewCtx.activeWindow$.next(Window.LibraryFunctionList);
      ctx.focusManager.focus({ type: "None" });
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
