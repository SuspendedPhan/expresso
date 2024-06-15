import hotkeys from "hotkeys-js";
import Logger from "./Logger";
import Selection from "./Selection";

const logger = Logger.file("Keyboard.ts");

export default class Keyboard {
  public static SCOPE = "Main";

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
    });
  }
}
