import hotkeys from "hotkeys-js";
import Logger from "./utils/Logger";

const logger = Logger.topic("Keyboard.ts");
Logger.onlyAllow("Keyboard.ts");
Logger.logToConsole();

export default class Keyboard {
  public static register() {
    hotkeys("down", function (event, handler) {
      logger.log("down");
    });
  }
}
