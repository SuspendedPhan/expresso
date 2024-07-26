import { withLatestFrom } from "rxjs";
import { attributeSceneInstancePathToString, type SceneInstancePath, sceneInstancePathToString } from "./SceneInstance";
import type { Component } from "src/ex-object/ExObject";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";
import type { SceneProperty } from "../ex-object/SceneAttribute";
import type { Evaluation } from "src/utils/utils/GoModule";
import type { SceneContext, SceneObject } from "./SceneContext";
import Logger from "../utils/logger/Logger";

export class SceneManager {
  private readonly sceneObjectBySceneInstancePath = new Map<string, SceneObject>();

  public constructor(private readonly ctx: SceneContext) {
    this.setup();
  }

  @loggedMethod
  private setup() {
    this.ctx.evaluator.eval$
      .pipe(withLatestFrom(this.ctx.mainCtx.eventBus.rootComponents$))
      .subscribe(([evaluation, rootComponents]) => {
        this.updateRootComponents(evaluation, rootComponents);
      });
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
    component.cloneCount$.subscribe((cloneCount) => {
      this.updateComponent1(component, evaluation, parentPath, cloneCount);
    });
  }

  private updateComponent1(
    component: Component,
    evaluation: Evaluation,
    parentPath: SceneInstancePath,
    cloneCount: number
  ) {
    for (let i = 0; i < cloneCount; i++) {
      const path = [
        ...parentPath,
        { componentId: component.id, cloneId: i.toString() },
      ];
      this.updateComponentSceneInstance(component, evaluation, path);
    }
  }

  @loggedMethod
  private updateComponentSceneInstance(
    component: Component,
    evaluation: Evaluation,
    path: SceneInstancePath
  ): void {
    Logger.arg("path", path);
    const pathString = sceneInstancePathToString(path);
    let sceneObject = this.sceneObjectBySceneInstancePath.get(pathString);
    if (!sceneObject) {
      sceneObject = this.ctx.pool.takeObject();
      this.sceneObjectBySceneInstancePath.set(pathString, sceneObject);
    }

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

  @loggedMethod
  private updateAttributeSceneInstance(
    sceneObject: SceneObject,
    sceneAttr: SceneProperty,
    path: SceneInstancePath,
    evaluation: Evaluation
  ): void {
    const pathString = attributeSceneInstancePathToString(this.ctx.mainCtx.goModule, sceneAttr, path);
    const result = evaluation.getResult(pathString);
    
    sceneObject.visible = true;
    sceneObject.scale.x = 100;
    sceneObject.scale.y = 100;
    const setter = sceneAttr.proto.sceneAttributeSetter;
    setter(sceneObject, result);
  }
}
