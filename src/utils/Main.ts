import { firstValueFrom } from "rxjs";
import { Attribute } from "../ExprFactory";
import MainContext from "../MainContext";
import GoModuleLoader from "./GoModuleLoader";
import Keyboard from "./Keyboard";
import Logger from "./Logger";
import YY from "./YY";
YY();

const logger = Logger.file("Main.ts");
// logger.allow();
// Logger.allow("MainView.svelte");

export default class Main {
  private constructor(public ctx: MainContext, public readonly attribute: Attribute) {
  }

  public static async setup(): Promise<Main> {
    const goModule = await firstValueFrom(GoModuleLoader.get$());
    const ctx = new MainContext(goModule);
    const attribute = ctx.exprFactory.createAttribute();
    ctx.selection.root$.next(attribute);
    
    ctx.selection.getSelectedObject$().subscribe((selectedObject) => {
      logger.log("selectedObject", selectedObject);
    });
    Keyboard.register(ctx.selection);
    return new Main(ctx, attribute);
  }
}