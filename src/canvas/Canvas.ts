// File: Canvas.ts

import { Effect } from "effect";
import type { Graphics } from "pixi.js";
import CanvasPool from "src/canvas/CanvasPool";
import { PixiFactory, type PixiFactoryArgs } from "src/canvas/PixiFactory";
import { EvaluatorCtx } from "src/evaluation/EvaluatorCtx";
import { ComponentParameterFactory } from "src/ex-object/ComponentParameter";
import { Project } from "src/ex-object/Project";
import { PropertyFactory } from "src/ex-object/Property";
import type { EvaluationResult } from "src/utils/utils/GoModule";
import { log5 } from "src/utils/utils/Log5";
import { isType } from "variant";

const log55 = log5("Canvas.ts", 9);
log55.debug("Canvas.ts");

export type LibCanvasObject = Graphics;

export function CanvasFactory(args: PixiFactoryArgs) {
  const pixiFactory = PixiFactory(args);
  const pool = new CanvasPool(() => pixiFactory.makeCircle());

  return Effect.gen(function* () {
    const evaluatorCtx = yield* EvaluatorCtx;
    const project = yield* Project.activeProject;

    evaluatorCtx.onEval.add((result) => {
      return Effect.gen(function* () {
        yield* updateCanvas(result);
      });
    });

    const updateCanvas = (result: EvaluationResult) => {
      return Effect.gen(function* () {
        pool.releaseAll();

        // console.log("Updating canvas");
        // console.log(result.getObjectResultCount());

        for (let i = 0; i < result.getObjectResultCount(); i++) {
          const canvasObject = pool.takeObject();
          // console.log(
          //   "Property result count",
          //   result.getPropertyResultCount(i)
          // );
          for (let j = 0; j < result.getPropertyResultCount(i); j++) {
            // console.log("Updating canvas object", i, j);

            const propertyId = result.getPropertyId(i, j);
            const propertyValue = result.getPropertyValue(i, j);
            const property = project.getProperty(propertyId);
            
            if (!isType(property, PropertyFactory.ComponentParameterProperty)) {
              continue;
            }

            const parameter = property.componentParameter;

            if (!isType(parameter, ComponentParameterFactory.Canvas)) {
              continue;
            };
            parameter.canvasSetter(canvasObject, propertyValue);

            canvasObject.scale.set(100, 100);
          }
        }
      });
    };
  });
}
