import hotkeys from "hotkeys-js";
import { first } from "rxjs";
import MainContext from "src/main-context/MainContext";
import { Window } from "src/main-context/MainViewContext";
import type FocusManager from "src/utils/utils/FocusManager";

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

    hotkeys("e", function (_event, _handler) {
      focusManager.getFocus$().pipe(first()).subscribe((focus) => {
        if (focus.type !== "ProjectNav") {
          return;
        }

        ctx.viewCtx.activeWindow$.next(Window.ProjectEditor);
        focusManager.focus({ type: "None" });
      });
    });

    hotkeys("c", function (_event, _handler) {
      focusManager.getFocus$().pipe(first()).subscribe((focus) => {
        if (focus.type !== "ProjectNav") {
          return;
        }
        ctx.viewCtx.activeWindow$.next(Window.ProjectComponentList);
        focusManager.focus({ type: "None" });
      });
    });

    hotkeys("g+e", function (_event, _handler) {
      ctx.viewCtx.activeWindow$.next(Window.ProjectEditor);
    });

    hotkeys("g+c", function (_event, _handler) {
      ctx.viewCtx.activeWindow$.next(Window.ProjectComponentList);
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
