import { BehaviorSubject, firstValueFrom } from "rxjs";
import Keyboard from "./Keyboard";
import MainContext from "../MainContext";
import GoModuleLoader from "./GoModuleLoader";
import Logger from "./Logger";
import ExprFactory from "../ExprFactory";
import { ReadonlyAttribute } from "../Domain";

const logger = Logger.file("Main.ts");
// logger.allow();
// Logger.allow("MainView.svelte");

export default class Main {
  public attribute;

  private constructor(public ctx: MainContext) {
    this.attribute = ctx.exprFactory.createAttribute();
    this.attribute.replaceWithCallExpr();
  }

  public static async setup(): Promise<Main> {
    const goModule = await firstValueFrom(GoModuleLoader.get$());
    const exprFactory = new ExprFactory();
    const ctx = new MainContext(goModule, exprFactory);

    
    // ctx.selection.getSelectedObject$().subscribe((selectedObject) => {
    //   logger.log("selectedObject", selectedObject);
    // });
    // Keyboard.register(ctx.selection);
    return new Main(ctx);
  }
}
