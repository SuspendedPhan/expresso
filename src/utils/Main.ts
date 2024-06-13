import { firstValueFrom } from "rxjs";
import Keyboard from "./Keyboard";
import MainContext from "../MainContext";
import GoModuleLoader from "./GoModuleLoader";
import Selection from "./Selection";
import Logger from "./Logger";

const logger = Logger.topic("Main.ts");
logger.allow();
Logger.allow("MainView.svelte");

export default class Main {
  private constructor(public ctx: MainContext) {}

  public static async setup(): Promise<Main> {
    const goModule = await firstValueFrom(GoModuleLoader.get$());
    const ctx = new MainContext(goModule);
    ctx.selection.getSelectedObject$().subscribe((selectedObject) => {
      logger.log("selectedObject", selectedObject);
    });
    Keyboard.register(ctx.selection);
    return new Main(ctx);
  }
}
