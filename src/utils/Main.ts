import { BehaviorSubject, first, firstValueFrom } from "rxjs";
import Keyboard from "./Keyboard";
import MainContext from "../MainContext";
import GoModuleLoader from "./GoModuleLoader";
import Logger from "./Logger";
import ExprFactory, { Attribute } from "../ExprFactory";
import Selection from "./Selection";

const logger = Logger.file("Main.ts");
// logger.allow();
// Logger.allow("MainView.svelte");

export default class Main {
  private constructor(public ctx: MainContext, public readonly attribute: Attribute) {
  }

  public static async setup(): Promise<Main> {
    const goModule = await firstValueFrom(GoModuleLoader.get$());
    const exprFactory = new ExprFactory();
    const attributeMut = exprFactory.createAttribute();
    attributeMut.exprMut$.pipe(first()).subscribe((expr) => {
      expr.exprBaseMut.replaceWithCallExpr();
    });
    attributeMut.exprMut$.subscribe((expr) => {
      console.log("Main.setup.subscribe", expr);
    });
    const ctx = new MainContext(goModule, exprFactory, new Selection(attributeMut.attribute));

    
    ctx.selection.getSelectedObject$().subscribe((selectedObject) => {
      logger.log("selectedObject", selectedObject);
    });
    Keyboard.register(ctx.selection);
    return new Main(ctx, attributeMut);
  }
}
