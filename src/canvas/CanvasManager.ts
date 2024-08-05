import { withLatestFrom } from "rxjs";
import { ComponentType, type CanvasSetter } from "src/ex-object/Component";
import type { ExObject } from "src/ex-object/ExObject";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";
import type { Evaluation } from "src/utils/utils/GoModule";
import Logger from "../utils/logger/Logger";
import type { CanvasContext, LibCanvasObject } from "./CanvasContext";
import { EvaluationUtils } from "src/evaluation/EvaluationUtils";
import { CanvasObjectUtils, type CanvasObjectPath } from "src/canvas/CanvasObject";

export class CanvasManager {
  private readonly canvasObjectByCanvasObjectPath = new Map<string, LibCanvasObject>();

  public constructor(private readonly ctx: CanvasContext) {
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
    parentPath: CanvasObjectPath
  ) {
    const cloneCount = EvaluationUtils.getCloneCount(
      this.ctx.mainCtx,
      evaluation,
      exObject,
      parentPath
    );
    this.updateExObject1(exObject, evaluation, parentPath, cloneCount);
  }

  private updateExObject1(
    exObject: ExObject,
    evaluation: Evaluation,
    parentPath: CanvasObjectPath,
    cloneCount: number
  ) {
    for (let i = 0; i < cloneCount; i++) {
      const path = [
        ...parentPath,
        { exObjectId: exObject.id, cloneId: i.toString() },
      ];
      this.updateCanvasObject(exObject, evaluation, path);
    }
  }

  @loggedMethod
  private updateCanvasObject(
    exObject: ExObject,
    evaluation: Evaluation,
    path: CanvasObjectPath
  ): void {
    Logger.arg("path", path);
    const pathString = CanvasObjectUtils.canvasObjectPathToString(path);
    let canvasObject = this.canvasObjectByCanvasObjectPath.get(pathString);
    if (!canvasObject) {
      canvasObject = this.ctx.pool.takeObject();
      this.canvasObjectByCanvasObjectPath.set(pathString, canvasObject);
    }

    const component = exObject.component;
    if (component.componentType !== ComponentType.CanvasComponent) {
      return;
    }

    for (const input of component.parameters) {
      this.updateCanvasProperty(
        canvasObject,
        input.id,
        input.canvasSetter,
        path,
        evaluation
      );
    }
  }

  @loggedMethod
  private updateCanvasProperty(
    canvasObject: LibCanvasObject,
    propertyId: string,
    canvasSetter: CanvasSetter,
    path: CanvasObjectPath,
    evaluation: Evaluation
  ): void {
    const pathString = CanvasObjectUtils.canvasPropertyPathToString(this.ctx.mainCtx.goModule, propertyId, path);
    const result = evaluation.getResult(pathString);
    
    canvasObject.visible = true;
    canvasObject.scale.x = 100;
    canvasObject.scale.y = 100;
    canvasSetter(canvasObject, result);
  }
}
