import { firstValueFrom } from "rxjs";
import { Attribute } from "../ExprFactory";
import MainContext from "../MainContext";
import GoModuleLoader from "./GoModuleLoader";
import Keyboard from "./Keyboard";
import GoModule from "./GoModule";
import Logger from "../logger/Logger";
import { loggedMethod } from "../logger/LoggerDecorator";

export default class Main {
  private constructor(public ctx: MainContext, public readonly attribute: Attribute) {

  }

  public static async setup(): Promise<Main> {
    const goModule = await firstValueFrom(GoModuleLoader.get$());
    return this.setupSync(goModule);
  }

  @loggedMethod
  private static setupSync(goModule: GoModule): Main {
    const logger = Logger.logger();
    Logger.logCallstack();
    const ctx = new MainContext(goModule);
    const attribute = ctx.exprFactory.createAttribute();
    ctx.selection.root$.next(attribute);
    
    ctx.selection.getSelectedObject$().subscribe((selectedObject) => {
      logger.log("selectedObject", selectedObject?.id ?? "null");
    });
    Keyboard.register(ctx.selection);
    return new Main(ctx, attribute);
  }
}