/*
OBS<Attribute> -> OBS<SceneObject>
*/

import { interval, map, switchMap, withLatestFrom } from "rxjs";
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
  private readonly tick$ = interval(1000);

  public constructor(private readonly ctx: SceneContext) {
    ctx.mainCtx.objectManager.onAttributeAdded$.subscribe((attr) => {
      const sceneObject = this.attrToSceneCircle(attr);
      this.sceneObjectToPixi(sceneObject);
    });
  }

  @loggedMethod
  private attrToSceneCircle(attr: Attribute): SceneObject {
    const logger = Logger.logger();
    return {
      x$: this.tick$.pipe(
        withLatestFrom(attr.expr$),
        switchMap(([_, expr]) => {
          logger.log("switchMap", expr.id);
          const result$ = this.ctx.mainCtx.goBridge.evalExpr$(expr);
          return result$;
        })
      ),
      destroy$: this.ctx.mainCtx.objectManager.getDestroy$(attr).pipe(map(() => {})),
    };
  }

  @loggedMethod
  private sceneObjectToPixi(sceneObject: SceneObject) {
    const logger = Logger.logger();
    Logger.logCallstack();
    const pixiObject = this.ctx.pool.takeCircle();
    sceneObject.x$.subscribe((x) => {
      pixiObject.visible = true;
      pixiObject.x = x;
      pixiObject.scale.x = 50;
      pixiObject.scale.y = 50;
    });

    sceneObject.destroy$.subscribe(() => {
      logger.log("destroying pixiObject");
      pixiObject.visible = false;
      this.ctx.pool.releaseCircle(pixiObject);
    });
  }
}
