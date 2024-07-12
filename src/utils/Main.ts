import { BehaviorSubject, first, firstValueFrom, Subject } from "rxjs";
import Keyboard from "./Keyboard";
import MainContext from "../MainContext";
import GoModuleLoader from "./GoModuleLoader";
import Logger from "./Logger";
import ExprFactory, { Attribute } from "../ExprFactory";
import Selection from "./Selection";
import { loggedMethod } from "../logger/LoggerDecorator";
import TT from "./TT";
TT();

const logger = Logger.file("Main.ts");
// logger.allow();
// Logger.allow("MainView.svelte");

export default class Main {
  private constructor(public ctx: MainContext, public readonly attribute: Attribute) {
  }

  public static async setup(): Promise<Main> {
    const goModule = await firstValueFrom(GoModuleLoader.get$());
    const exprFactory = new ExprFactory();
    
    const ctx = new MainContext(goModule, exprFactory, new Selection());
    
    const attribute = exprFactory.createAttribute();
    ctx.selection.root$.next(attribute);
    
    ctx.selection.selectedObject$.subscribe((selectedObject) => {
      logger.log("selectedObject", selectedObject);
    });
    Keyboard.register(ctx.selection);
    return new Main(ctx, attribute);
  }
}