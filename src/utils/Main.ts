import { first, map, type Observable } from "rxjs";
import type { Attribute } from "../ex-object/ExObject";
import MainContext from "../main-context/MainContext";
import type GoModule from "./GoModule";
import GoModuleLoader from "./GoModuleLoader";
import Keyboard from "./Keyboard";
import { ProtoSceneAttributeStore } from "../SceneAttribute";

export default class Main {
  public readonly attribute: Attribute;
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
    this.attribute = ctx.mutator.createMainObject().sceneAttributeByProto.get(ProtoSceneAttributeStore.x)!;
    ctx.selection.root$.next(this.attribute);
    Keyboard.register(ctx.selection);
  }
}
