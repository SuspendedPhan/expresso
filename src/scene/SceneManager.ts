import { withLatestFrom } from "rxjs";
import { attributeSceneInstancePathToString, SceneInstancePath, sceneInstancePathToString } from "../SceneInstance";
import { Component } from "../ExObject";
import { loggedMethod } from "../logger/LoggerDecorator";
import { SceneAttribute } from "../SceneAttribute";
import { Evaluation } from "../utils/GoModule";
import { SceneContext, SceneObject } from "./SceneContext";
import Logger from "../logger/Logger";

export class SceneManager {
  private readonly sceneObjectBySceneInstancePath = new Map<string, SceneObject>();

  public constructor(private readonly ctx: SceneContext) {
    this.setup();
  }

  @loggedMethod
  private setup() {
    Logger.logThis();
    Logger.logCallstack();
    this.ctx.evaluator.eval$
      .pipe(withLatestFrom(this.ctx.mainCtx.eventBus.rootComponents$))
      .subscribe(([evaluation, rootComponents]) => {
        console.log("Updating root components");
        
        this.updateRootComponents(evaluation, rootComponents);
      });
  }

  // @ts-ignore
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
    sceneAttr: SceneAttribute,
    path: SceneInstancePath,
    evaluation: Evaluation
  ): void {
    const pathString = attributeSceneInstancePathToString(this.ctx.mainCtx.goModule, sceneAttr, path);
    const result = evaluation.getResult(pathString);
    console.log("result", result);
    
    sceneObject.visible = true;
    sceneObject.scale.x = 100;
    sceneObject.scale.y = 100;
    const setter = sceneAttr.proto.sceneAttributeSetter;
    setter(sceneObject, result);
    console.log("sceneObject", sceneObject);
  }
}
