import { Effect } from "effect";
import type { Graphics } from "pixi.js";
import { withLatestFrom } from "rxjs";
import {
  CanvasObjectUtils,
  type CanvasObjectPath,
} from "src/canvas/CanvasObject";
import CanvasPool from "src/canvas/CanvasPool";
import { PixiFactory, type PixiFactoryArgs } from "src/canvas/PixiFactory";
import { GoModuleCtx } from "src/ctx/GoModuleCtx";
import { EvaluationUtils } from "src/evaluation/EvaluationUtils";
import { EvaluatorCtx } from "src/evaluation/EvaluatorCtx";
import { ComponentFactory, type CanvasSetter } from "src/ex-object/Component";
import { ComponentParameterFactory } from "src/ex-object/ComponentParameter";
import type { ExObject } from "src/ex-object/ExObject";
import { Project } from "src/ex-object/Project";
import type { Evaluation } from "src/utils/utils/GoModule";
import { isType } from "variant";
import Logger from "../utils/logger/Logger";

export type LibCanvasObject = Graphics;

export function CanvasFactory(args: PixiFactoryArgs) {
  const pixiFactory = PixiFactory(args);
  const pool = new CanvasPool(() => pixiFactory.makeCircle());

  const effect = Effect.gen(function* () {
    const evaluatorCtx = yield* EvaluatorCtx;
    const project = yield* Project.activeProject;
    const rootExObjects = project.rootExObjects;
    const goModuleCtx = yield* GoModuleCtx;
    const goModule = yield* goModuleCtx.goModule;

    const canvasObjectByCanvasObjectPath = new Map<string, LibCanvasObject>();

    evaluatorCtx.eval$
      .pipe(withLatestFrom(rootExObjects.items$))
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
        goModule,
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

    function updateCanvasObject(
      exObject: ExObject,
      evaluation: Evaluation,
      path: CanvasObjectPath
    ): void {
      Logger.arg("path", path);
      const pathString = CanvasObjectUtils.canvasObjectPathToString(path);
      let canvasObject = canvasObjectByCanvasObjectPath.get(pathString);
      if (canvasObject === undefined) {
        canvasObject = pool.takeObject();
        canvasObjectByCanvasObjectPath.set(pathString, canvasObject);
      }

      const component = exObject.component;
      if (isType(component, ComponentFactory.Canvas)) {
        return;
      }

      exObject.componentParameterProperties.forEach(
        (componentParameterProperty) => {
          if (
            !isType(
              componentParameterProperty.componentParameter,
              ComponentParameterFactory.Canvas
            )
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

    function updateCanvasProperty(
      canvasObject: LibCanvasObject,
      propertyId: string,
      canvasSetter: CanvasSetter,
      path: CanvasObjectPath,
      evaluation: Evaluation
    ): void {
      const pathString = CanvasObjectUtils.canvasPropertyPathToString(
        goModule,
        propertyId,
        path
      );
      const result = evaluation.getResult(pathString);

      canvasObject.visible = true;
      canvasObject.scale.x = 100;
      canvasObject.scale.y = 100;
      canvasSetter(canvasObject, result);
    }
  });

  return effect;
}
