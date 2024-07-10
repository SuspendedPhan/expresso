import { BehaviorSubject, first, firstValueFrom } from "rxjs";
import Keyboard from "./Keyboard";
import MainContext from "../MainContext";
import GoModuleLoader from "./GoModuleLoader";
import Logger from "./Logger";
import ExprFactory from "../ExprFactory";
import { ReadonlyAttribute } from "../Domain";
import Selection from "./Selection";

const logger = Logger.file("Main.ts");
// logger.allow();
// Logger.allow("MainView.svelte");

export default class Main {
  private constructor(public ctx: MainContext, public readonly attribute: ReadonlyAttribute) {
  }

  public static async setup(): Promise<Main> {
    const goModule = await firstValueFrom(GoModuleLoader.get$());
    const exprFactory = new ExprFactory();
    const attribute = exprFactory.createAttribute();
    attribute.expr$.pipe(first()).subscribe((expr) => {
      expr.exprReplacer.replaceWithCallExpr();
    });
    attribute.expr$.subscribe((expr) => {
      console.log("Main.setup.subscribe", expr);
    });
    const ctx = new MainContext(goModule, exprFactory, new Selection(attribute.readonlyAttribute));

    
    ctx.selection.getSelectedObject$().subscribe((selectedObject) => {
      logger.log("selectedObject", selectedObject);
    });
    Keyboard.register(ctx.selection);
    return new Main(ctx, attribute.readonlyAttribute);
  }
}
