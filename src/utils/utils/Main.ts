import { first, map, type Observable } from "rxjs";
import type { Attribute } from "src/ex-object/ExObject";
import MainContext from "src/main-context/MainContext";
import type GoModule from "src/utils/utils/GoModule";
import GoModuleLoader from "src/utils/utils/GoModuleLoader";
import Keyboard from "src/utils/utils/Keyboard";
import { ProtoSceneAttributeStore } from "src/ex-object/SceneAttribute";

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

    document.addEventListener("mousedown", () => {
      ctx?.selection.select(null);
    });
  }
}
