/*
OBS<Attribute> -> OBS<SceneObject>
*/

import { interval, withLatestFrom } from "rxjs";
import { Component } from "../ExObject";
import { loggedMethod } from "../logger/LoggerDecorator";
import { SceneAttribute } from "../SceneAttribute";
import { Evaluation } from "../utils/GoModule";
import { SceneContext, SceneObject } from "./SceneContext";
import { SceneInstancePath } from "../CloneInstance";

export class SceneManager {
  public constructor(private readonly ctx: SceneContext) {
    this.setup();
  }

  @loggedMethod
  private setup() {
    this.ctx.evaluator.eval$
      .pipe(withLatestFrom(this.ctx.mainCtx.rootComponents$))
      .subscribe(([evaluation, rootComponents]) => {
        this.updateRootComponents(evaluation, rootComponents);
      });
  }

  private getCloneCount(component: Component): number {
    return 1;
  }

  private updateRootComponents(
    evaluation: Evaluation,
    rootComponents: readonly Component[]
  ): void {
    for (const component of rootComponents) {
      this.updateComponent(component, evaluation, []);
    }
  }

  private updateComponent(
    component: Component,
    evaluation: Evaluation,
    parentPath: SceneInstancePath
  ): void {
    const cloneCount = this.getCloneCount(component);
    for (let i = 0; i < cloneCount; i++) {
      const path = [
        ...parentPath,
        { componentId: component.id, cloneId: i.toString() },
      ];
      this.updateComponentSceneInstance(component, evaluation, path);
    }
  }

  private updateComponentSceneInstance(
    component: Component,
    evaluation: Evaluation,
    path: SceneInstancePath
  ): void {
    const sceneObject = this.ctx.pool.takeObject();
    const sceneAttributes = Array.from(
      component.sceneAttributeByProto.values()
    );
    for (const sceneAttr of sceneAttributes) {
      this.updateAttributeSceneInstance(
        sceneObject,
        sceneAttr,
        path,
        evaluation
      );
    }
  }

  private updateAttributeSceneInstance(
    sceneObject: SceneObject,
    sceneAttr: SceneAttribute,
    path: SceneInstancePath,
    evaluation: Evaluation
  ): void {
    const result = evaluation.getResult(sceneAttr.id, path);
    const setter = sceneAttr.proto.sceneAttributeSetter;
    setter(sceneObject, result);
  }
}
