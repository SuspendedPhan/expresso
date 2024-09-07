import { withLatestFrom } from "rxjs";
import {
  CanvasObjectUtils,
  type CanvasObjectPath,
} from "src/canvas/CanvasObject";
import { EvaluationUtils } from "src/evaluation/EvaluationUtils";
import {
  type CanvasSetter,
} from "src/ex-object/Component";
import type { ExObject } from "src/ex-object/ExObject";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";
import type { Evaluation } from "src/utils/utils/GoModule";
import Logger from "../utils/logger/Logger";
import type { CanvasContext, LibCanvasObject } from "./CanvasContext";

export function CanvasManagerFactory() {
  const canvasObjectByCanvasObjectPath = new Map<
    string,
    LibCanvasObject
  >();

  ctx.evaluator.eval$
    .pipe(withLatestFrom(ctx.mainCtx.eventBus.rootObjects$))
    .subscribe(([evaluation, rootExObjects]) => {
      updateRootExObjects(evaluation, rootExObjects);
    });

  function updateRootExObjects(
    evaluation: Evaluation,
    rootExObjects: readonly ExObject[]
  ): void {
    for (const exObject of rootExObjects) {
      updateExObject(exObject, evaluation, []);
    }
  }

  function updateExObject(
    exObject: ExObject,
    evaluation: Evaluation,
    parentPath: CanvasObjectPath
  ) {
    const cloneCount = EvaluationUtils.getCloneCount(
      ctx.mainCtx,
      evaluation,
      exObject,
      parentPath
    );
    updateExObject1(exObject, evaluation, parentPath, cloneCount);
  }

  function updateExObject1(
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
      updateCanvasObject(exObject, evaluation, path);
    }
  }

  @loggedMethod
  function updateCanvasObject(
    exObject: ExObject,
    evaluation: Evaluation,
    path: CanvasObjectPath
  ): void {
    Logger.arg("path", path);
    const pathString = CanvasObjectUtils.canvasObjectPathToString(path);
    let canvasObject = canvasObjectByCanvasObjectPath.get(pathString);
    if (!canvasObject) {
      canvasObject = ctx.pool.takeObject();
      canvasObjectByCanvasObjectPath.set(pathString, canvasObject);
    }

    const component = exObject.component;
    if (component.componentKind !== ComponentKind.CanvasComponent) {
      return;
    }

    exObject.componentParameterProperties.forEach(
      (componentParameterProperty) => {
        if (
          componentParameterProperty.componentParameter
            .componentParameterKind !==
          ComponentParameterKind.CanvasComponentParameter
        ) {
          return;
        }

        updateCanvasProperty(
          canvasObject,
          componentParameterProperty.id,
          componentParameterProperty.componentParameter.canvasSetter,
          path,
          evaluation
        );
      }
    );
  }

  @loggedMethod
  function updateCanvasProperty(
    canvasObject: LibCanvasObject,
    propertyId: string,
    canvasSetter: CanvasSetter,
    path: CanvasObjectPath,
    evaluation: Evaluation
  ): void {
    const pathString = CanvasObjectUtils.canvasPropertyPathToString(
      ctx.mainCtx.goModule,
      propertyId,
      path
    );
    const result = evaluation.getResult(pathString);

    canvasObject.visible = true;
    canvasObject.scale.x = 100;
    canvasObject.scale.y = 100;
    canvasSetter(canvasObject, result);
  }
}
