import hotkeys from "hotkeys-js";
import type FocusManager from "src/utils/utils/FocusManager";

export default class Keyboard {
  public static SCOPE = "Main";

  private static scopes: string[] = [];

  public static pushScope(scope: string) {
    this.scopes.push(scope);
  }

  public static popScope() {
    this.scopes.pop();
  }
  
  public static register(selection: FocusManager) {
    hotkeys.setScope(this.SCOPE);

    hotkeys("down", this.SCOPE, function (_event, _handler) {
      selection.down$.next();
      return false;
    });

    hotkeys("up", this.SCOPE, function (_event, _handler) {
      selection.up$.next();
      return false;
    });

    hotkeys("left", this.SCOPE, function (_event, _handler) {
      selection.left();
      return false;
    });

    hotkeys("right", this.SCOPE, function (_event, _handler) {
      selection.right();
      return false;
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
