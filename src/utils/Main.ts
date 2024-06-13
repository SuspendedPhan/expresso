import { firstValueFrom } from "rxjs";
import Keyboard from "./Keyboard";
import MainContext from "../MainContext";
import GoModuleLoader from "./GoModuleLoader";
import Selection from "./Selection";

export default class Main {
  private constructor(public ctx: MainContext) {}

  public static async setup(): Promise<Main> {
    const goModule = await firstValueFrom(GoModuleLoader.get$());
    const ctx = new MainContext(goModule);
    Keyboard.register(ctx.selection);
    return new Main(ctx);
  }
}
