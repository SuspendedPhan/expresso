import {
  CanvasObjectUtils,
  type CanvasObjectPath,
  type CloneCountCanvasPropertyPath,
} from "src/canvas/CanvasObject";
import type { ExObject } from "src/ex-object/ExObject";
import type GoModule from "src/utils/utils/GoModule";
import type { Evaluation } from "src/utils/utils/GoModule";

export namespace EvaluationUtils {
  export function getCloneCount(
    goModule: GoModule,
    evaluation: Evaluation,
    exObject: ExObject,
    parentPath: CanvasObjectPath
  ): number {
    const property = exObject.cloneCountProperty;
    const cloneCountCanvasPropertyPath: CloneCountCanvasPropertyPath = {
      parentCanvasObjectPath: parentPath,
      exObjectId: exObject.id,
      cloneCountPropertyId: property.id,
    };
    const pathString = CanvasObjectUtils.cloneCountCanvasPropertyPathToString(goModule, cloneCountCanvasPropertyPath);
    const result = evaluation.getResult(pathString);
    return result;
  }
}