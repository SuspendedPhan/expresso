import { BehaviorSubject, first, firstValueFrom, Subject } from "rxjs";
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
    
    const root$ = new Subject<Attribute>();
    const ctx = new MainContext(goModule, exprFactory, new Selection(root$));
    
    const attribute = exprFactory.createAttribute();
    root$.next(attribute);
    
    ctx.selection.getSelectedObject$().subscribe((selectedObject) => {
      logger.log("selectedObject", selectedObject);
    });
    Keyboard.register(ctx.selection);
    return new Main(ctx, attribute);
  }
}
