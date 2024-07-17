/*
OBS<Attribute> -> OBS<SceneObject>
*/

import { interval, switchMap, withLatestFrom } from "rxjs";
import Logger from "../logger/Logger";
import { loggedMethod } from "../logger/LoggerDecorator";
import { SceneAttribute } from "../SceneAttribute";
import { OBS } from "../utils/Utils";
import { SceneContext } from "./SceneContext";

interface SceneObject {
  value$: OBS<number>;
  sceneAttribute: SceneAttribute;
}

export class SceneManager {
  private readonly tick$ = interval(1000);

  public constructor(private readonly ctx: SceneContext) {
    this.setup();
  }

  @loggedMethod
  private setup() {
    Logger.logThis();
    const logger = Logger.logger();
    this.ctx.mainCtx.onSceneAttributeAdded$.subscribe((attr) => {
      logger.log("onSceneAttributeAdded$", attr.attribute.id);
      const sceneObject = this.attrToSceneCircle(attr);
      this.sceneObjectToPixi(sceneObject);
    });
  }

  @loggedMethod
  // @ts-ignore
  private attrToSceneCircle(sceneAttr: SceneAttribute): SceneObject {
    const logger = Logger.logger();
    Logger.logCallstack();
    return {
      value$: this.tick$.pipe(
        withLatestFrom(sceneAttr.attribute.expr$),
        switchMap(([_, expr]) => {
          logger.log("switchMap", expr.id);
          const result$ = this.ctx.mainCtx.goBridge.evalExpr$(expr);
          return result$;
        })
      ),
      sceneAttribute: sceneAttr,
    };
  }

  @loggedMethod
  // @ts-ignore
  private sceneObjectToPixi(sceneObject: SceneObject) {
    const logger = Logger.logger();
    Logger.logCallstack();
    const pixiObject = this.ctx.pool.takeCircle();

    const sceneAttribute = sceneObject.sceneAttribute;

    sceneObject.value$.subscribe((value) => {
      logger.log("subscribe", value);
      pixiObject.visible = true;
      sceneAttribute.proto.pixiSetter(pixiObject, value);
      pixiObject.scale.x = 50;
      pixiObject.scale.y = 50;
    });

    sceneAttribute.attribute.destroy$.subscribe(() => {
      logger.log("destroying pixiObject");
      pixiObject.visible = false;
      this.ctx.pool.releaseCircle(pixiObject);
    });
  }
}
