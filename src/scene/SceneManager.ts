/*
OBS<Attribute> -> OBS<SceneObject>
*/

import { interval, switchMap, withLatestFrom } from "rxjs";
import Logger from "../logger/Logger";
import { loggedMethod } from "../logger/LoggerDecorator";
import { SceneAttribute } from "../SceneAttribute";
import { OBS } from "../utils/Utils";
import { SceneContext } from "./SceneContext";
import { Component } from "../ExObject";
import { Evaluation } from "../utils/GoModule";
interface SceneObject {
  readonly sceneObjectAttributes: readonly SceneObjectAttribute[];
}

interface SceneObjectAttribute {
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
    this.ctx.mainCtx.onComponentAdded$.subscribe((component) => {
      const sceneObject = this.componentToSceneObject(component);
      this.addObjectToScene(sceneObject);
    });

    this.ctx.evaluator.eval$.subscribe((...args) => this.handleEval(...args));
  }
  private handleEval(evaluation: Evaluation, componentIds: readonly string[]): void {
    const r = evaluation.getResult("test");
  }

  private componentToSceneObject(component: Component): SceneObject {


    const sceneObjectAttributes: SceneObjectAttribute[] = [];
    for (const sceneAttribute of component.sceneAttributeByProto.values()) {
      const sceneObjectAttribute = this.createSceneObjectAttribute(sceneAttribute);
      sceneObjectAttributes.push(sceneObjectAttribute);
    }

    return {
      sceneObjectAttributes
    };
  }

  private createSceneObjectAttribute(sceneAttribute: SceneAttribute): SceneObjectAttribute {
    return {
      value$: this.tick$.pipe(
        withLatestFrom(sceneAttribute.attribute.expr$),
        switchMap(([_, expr]) => {
          const result$ = this.ctx.mainCtx.goBridge.evalExpr$(expr);
          return result$;
        })
      ),
      sceneAttribute: sceneAttribute,
    };
  }

  @loggedMethod
  // @ts-ignore
  private addObjectToScene(sceneObject: SceneObject) {
    const logger = Logger.logger();
    const pixiObject = this.ctx.pool.takeCircle();

    for (const sceneObjectAttribute of sceneObject.sceneObjectAttributes) {
      sceneObjectAttribute.sceneAttribute.proto.pixiSetter(pixiObject, 0);
    }

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
