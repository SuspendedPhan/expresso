/*
OBS<Attribute> -> OBS<SceneObject>
*/

import { map } from "rxjs";
import { Attribute } from "../ExObjectFactory";
import { OBS } from "../utils/Utils";
import { SceneContext } from "./SceneContext";

export interface SceneObject {
  x$: OBS<number>;
  destroy$: OBS<void>;
}

export class SceneObjectManager {
  public constructor(private readonly ctx: SceneContext) {
    ctx.mainCtx.objectFactory.onAttributeAdded$.subscribe((attr) => {
      const sceneCircle = this.attrToSceneCircle(attr);
      this.sceneObjectToPixi(sceneCircle);
    });
  }

  private attrToSceneCircle(attr: Attribute): SceneObject {
    return {
      x$: attr.expr$.pipe(
        map((expr) => {
          const r = this.ctx.mainCtx.goModule.evalExpr(expr.id);
          return r;
        })
      ),
      destroy$: this.ctx.mainCtx.objectManager.getDestroy$(attr).pipe(map(() => {})),
    };
  }

  private sceneObjectToPixi(sceneObject: SceneObject) {
    const pixiObject = this.ctx.pool.takeCircle();
    sceneObject.x$.subscribe((x) => {
      pixiObject.x = x;
      pixiObject.scale.x = 50;
      pixiObject.scale.y = 50;
    });

    sceneObject.destroy$.subscribe(() => {
      this.ctx.pool.releaseCircle(pixiObject);
    });
  }
}
