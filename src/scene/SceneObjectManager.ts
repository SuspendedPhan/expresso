/*
OBS<Attribute> -> OBS<SceneObject>
*/

import { interval, switchMap, withLatestFrom } from "rxjs";
import Logger from "../logger/Logger";
import { loggedMethod } from "../logger/LoggerDecorator";
import { SceneAttribute } from "../SceneAttribute";
import { OBS } from "../utils/Utils";
import { SceneContext } from "./SceneContext";

interface SceneObjectAttribute {
  value$: OBS<number>;
  sceneAttribute: SceneAttribute;
}

export interface SceneObject {
  x: SceneObjectAttribute;
  destroy$: OBS<void>;
}

export class SceneObjectManager {
  private readonly tick$ = interval(1000);

  public constructor(private readonly ctx: SceneContext) {
    // todp
    
    // ctx.mainCtx.objectManager.onAttributeAdded$.subscribe((attr) => {
    //   const sceneObject = this.attrToSceneCircle(attr);
    //   this.sceneObjectToPixi(sceneObject);
    // });
  }

  @loggedMethod
  // @ts-ignore
  private attrToSceneCircle(sceneAttr: SceneAttribute): SceneObject {
    const logger = Logger.logger();
    return {
      x: {
        value$: this.tick$.pipe(
          withLatestFrom(sceneAttr.attribute.expr$),
          switchMap(([_, expr]) => {
            logger.log("switchMap", expr.id);
            const result$ = this.ctx.mainCtx.goBridge.evalExpr$(expr);
            return result$;
          })
        ),
        sceneAttribute: sceneAttr,
      },
      
      destroy$: sceneAttr.attribute.destroy$,
    };
  }

  @loggedMethod
  // @ts-ignore
  private sceneObjectToPixi(sceneObject: SceneObject) {
    const logger = Logger.logger();
    Logger.logCallstack();
    const pixiObject = this.ctx.pool.takeCircle();
    sceneObject.x.value$.subscribe((x) => {
      pixiObject.visible = true;
      sceneObject.x.sceneAttribute.metadata.pixiSetter(pixiObject, x);
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
