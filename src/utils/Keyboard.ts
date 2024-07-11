import hotkeys from "hotkeys-js";
import Logger from "./Logger";
import Selection from "./Selection";
import { loggedMethod } from "../logger/LoggerDecorator";

const logger = Logger.file("Keyboard.ts");

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
    logger.log("register");
    hotkeys.setScope(this.SCOPE);

    hotkeys("down", this.SCOPE, function (_event, _handler) {
      logger.log("down");
      selection.down();
    });

    hotkeys("up", this.SCOPE, function (_event, _handler) {
      logger.log("up");
      selection.up();
    });

    hotkeys("left", this.SCOPE, function (_event, _handler) {
      logger.log("left");
    });

    hotkeys("right", this.SCOPE, function (_event, _handler) {
      logger.log("right");
      selection.selectedObject$.next(null);
    });
  }
}
