import { withLatestFrom } from "rxjs";
import { attributeSceneInstancePathToString, type SceneInstancePath, sceneInstancePathToString } from "./SceneInstance";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";
import type { Evaluation } from "src/utils/utils/GoModule";
import type { SceneContext, SceneObject } from "./SceneContext";
import Logger from "../utils/logger/Logger";
import type { ExObject } from "src/ex-object/ExObject";
import { ComponentType, type SceneSetter } from "src/ex-object/Component";

export class SceneManager {
  private readonly sceneObjectBySceneInstancePath = new Map<string, SceneObject>();

  public constructor(private readonly ctx: SceneContext) {
    this.setup();
  }

  @loggedMethod
  private setup() {
    this.ctx.evaluator.eval$
      .pipe(withLatestFrom(this.ctx.mainCtx.eventBus.rootObjects$))
      .subscribe(([evaluation, rootExObjects]) => {
        this.updateRootExObjects(evaluation, rootExObjects);
      });
  }

  private updateRootExObjects(
    evaluation: Evaluation,
    rootExObjects: readonly ExObject[]
  ): void {
    for (const exObject of rootExObjects) {
      this.updateExObject(exObject, evaluation, []);
    }
  }

  private updateExObject(
    exObject: ExObject,
    evaluation: Evaluation,
    parentPath: SceneInstancePath
  ): void {
    exObject.cloneCountProperty$.subscribe((cloneCount) => {
      this.updateExObject1(exObject, evaluation, parentPath, cloneCount);
    });
  }

  private updateExObject1(
    exObject: ExObject,
    evaluation: Evaluation,
    parentPath: SceneInstancePath,
    cloneCount: number
  ) {
    for (let i = 0; i < cloneCount; i++) {
      const path = [
        ...parentPath,
        { exObjectId: exObject.id, cloneId: i.toString() },
      ];
      this.updateExObjectSceneInstance(exObject, evaluation, path);
    }
  }

  @loggedMethod
  private updateExObjectSceneInstance(
    exObject: ExObject,
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

    const component = exObject.component;
    if (component.componentType !== ComponentType.SceneComponent) {
      return;
    }

    for (const input of component.parameters) {
      this.updateAttributeSceneInstance(
        sceneObject,
        input.id,
        input.sceneSetter,
        path,
        evaluation
      );
    }
  }

  @loggedMethod
  private updateAttributeSceneInstance(
    sceneObject: SceneObject,
    propertyId: string,
    sceneSetter: SceneSetter,
    path: SceneInstancePath,
    evaluation: Evaluation
  ): void {
    const pathString = attributeSceneInstancePathToString(this.ctx.mainCtx.goModule, propertyId, path);
    const result = evaluation.getResult(pathString);
    
    sceneObject.visible = true;
    sceneObject.scale.x = 100;
    sceneObject.scale.y = 100;
    sceneSetter(sceneObject, result);
  }
}
