import { BehaviorSubject, firstValueFrom } from "rxjs";
import Keyboard from "./Keyboard";
import MainContext from "./MainContext";
import GoModuleLoader from "./utils/GoModuleLoader";

export default class Main {
  private constructor(public ctx: MainContext) {}

  public static async setup(): Promise<Main> {
    Keyboard.register();

    const goModule = await firstValueFrom(GoModuleLoader.get$());
    const ctx = new MainContext(goModule);
    return new Main(ctx);
  }
}
