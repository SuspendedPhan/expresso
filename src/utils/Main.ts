import { first, map, Observable } from "rxjs";
import { Attribute } from "../ExObjectFactory";
import MainContext from "../MainContext";
import PixiFactory from "../renderer/PixiFactory";
import { SceneMain } from "../renderer/SceneMain";
import GoModule from "./GoModule";
import GoModuleLoader from "./GoModuleLoader";
import Keyboard from "./Keyboard";
import { OBS } from "./Utils";

export default class Main {
  public readonly attribute$: Observable<Attribute>;
  public readonly ctx: MainContext;

  public static setup$(pixiFactory: OBS<PixiFactory>): Observable<Main> {
    return GoModuleLoader.get$().pipe(
      first(),
      map((goModule) => {
        return new Main(goModule, pixiFactory);
      })
    );
  }

  public constructor(goModule: GoModule, pixiFactory: OBS<PixiFactory>) {
    const ctx = new MainContext(goModule);
    this.ctx = ctx;
    this.attribute$ = ctx.mutator.createAttribute$();
    ctx.selection.setRoot$(this.attribute$);
    Keyboard.register(ctx.selection);

    pixiFactory.pipe(first()).subscribe((pixiFactory) => {
      new SceneMain(ctx, pixiFactory);
    });
  }
}
