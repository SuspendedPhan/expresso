/*
OBS<Attribute> -> OBS<SceneObject>
*/

import { map, of, switchMap } from "rxjs";
import { Attribute } from "../ExObjectFactory";
import Logger from "../logger/Logger";
import { loggedMethod } from "../logger/LoggerDecorator";
import { OBS } from "../utils/Utils";
import { SceneContext } from "./SceneContext";

export interface SceneObject {
  x$: OBS<number>;
  destroy$: OBS<void>;
}

export class SceneObjectManager {
  public constructor(private readonly ctx: SceneContext) {
    ctx.mainCtx.objectManager.onAttributeAdded$.subscribe((attr) => {
      const sceneCircle = this.attrToSceneCircle(attr);
      this.sceneObjectToPixi(sceneCircle);
    });
  }

  private attrToSceneCircle(attr: Attribute): SceneObject {
    return {
      x$: attr.expr$.pipe(
        switchMap((expr) => {
          return this.ctx.mainCtx.goBridge.evalExpr$(expr);
        })
      ),
      // x$: of(0),
      destroy$: this.ctx.mainCtx.objectManager.getDestroy$(attr),
    };
  }

  @loggedMethod
  private sceneObjectToPixi(sceneObject: SceneObject) {
    Logger.logCallstack();
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
