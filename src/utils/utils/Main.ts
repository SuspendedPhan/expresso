import { first, map, type Observable } from "rxjs";
import MainContext from "src/main-context/MainContext";
import type GoModule from "src/utils/utils/GoModule";
import GoModuleLoader from "src/utils/utils/GoModuleLoader";
import Keyboard from "src/utils/utils/Keyboard";

export default class Main {
  public readonly ctx: MainContext;

  public static setup$(): Observable<Main> {
    return GoModuleLoader.get$().pipe(
      first(),
      map((goModule) => {
        return new Main(goModule);
      })
    );
  }

  public constructor(goModule: GoModule) {
    const ctx = new MainContext(goModule);
    this.ctx = ctx;
    Keyboard.register(ctx.selection);

    document.addEventListener("mousedown", () => {
      ctx?.selection.select(null);
    });
  }
}
