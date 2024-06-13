import hotkeys from "hotkeys-js";
import Logger from "./Logger";
import Selection from "./Selection";

const logger = Logger.topic("Keyboard.ts");

export default class Keyboard {
  public static register(selection: Selection) {
    logger.log("register");

    hotkeys("down", function (event, handler) {
      logger.log("down");
      selection.down();
    });

    hotkeys("up", function (event, handler) {
      logger.log("up");
      selection.up();
    });

    hotkeys("left", function (event, handler) {
      logger.log("left");
    });

    hotkeys("right", function (event, handler) {
      logger.log("right");
    });
  }
}
