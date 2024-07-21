import hotkeys from "hotkeys-js";
import type Selection from "src/utils/utils/Selection";

export default class Keyboard {
  public static SCOPE = "Main";

  private static scopes: string[] = [];

  public static pushScope(scope: string) {
    this.scopes.push(scope);
  }

  public static popScope() {
    this.scopes.pop();
  }
  
  public static register(selection: Selection) {
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
      return false;
    });

    hotkeys("right", this.SCOPE, function (_event, _handler) {
      return false;
      // selection.selectedObject$.next(null);
    });
  }
}
