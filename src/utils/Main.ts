import { firstValueFrom } from "rxjs";
import Keyboard from "./Keyboard";
import MainContext from "../MainContext";
import GoModuleLoader from "./GoModuleLoader";
import Logger from "./Logger";
import ExprFactory from "../ExprFactory";

const logger = Logger.file("Main.ts");
// logger.allow();
// Logger.allow("MainView.svelte");

export default class Main {
  private constructor(public ctx: MainContext) {}

  public static async setup(): Promise<Main> {
    const goModule = await firstValueFrom(GoModuleLoader.get$());
    const exprFactory = new ExprFactory();
    new MainContext(goModule, exprFactory);
    const a = exprFactory.createAttribute();
    a.expr$.subscribe((expr) => {
      const r = goModule.evalExpr(expr.id);
      console.log("r", r);
    });
    // ctx.selection.getSelectedObject$().subscribe((selectedObject) => {
    //   logger.log("selectedObject", selectedObject);
    // });
    // Keyboard.register(ctx.selection);
    return new Main(ctx);
  }
}
