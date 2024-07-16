import { first, map, Observable } from "rxjs";
import { Attribute } from "../ExObject";
import MainContext from "../MainContext";
import GoModule from "./GoModule";
import GoModuleLoader from "./GoModuleLoader";
import Keyboard from "./Keyboard";

export default class Main {
  public readonly attribute$: Observable<Attribute>;
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
    this.attribute$ = ctx.mutator.createAttribute$();
    ctx.selection.setRoot$(this.attribute$);
    Keyboard.register(ctx.selection);
  }
}
