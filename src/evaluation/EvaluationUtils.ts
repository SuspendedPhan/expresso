import { firstValueFrom } from "rxjs";
import {
  CanvasObjectUtils,
  type CanvasObjectPath,
  type CloneCountCanvasPropertyPath,
} from "src/canvas/CanvasObject";
import type { ExObject } from "src/ex-object/ExObject";
import type MainContext from "src/main-context/MainContext";
import type { Evaluation } from "src/utils/utils/GoModule";

export namespace EvaluationUtils {
  export async function getCloneCount(
    ctx: MainContext,
    evaluation: Evaluation,
    exObject: ExObject,
    parentPath: CanvasObjectPath
  ): Promise<number> {
    const property = await firstValueFrom(exObject.cloneCountProperty$);
    const cloneCountCanvasPropertyPath: CloneCountCanvasPropertyPath = {
      parentCanvasObjectPath: parentPath,
      exObjectId: exObject.id,
      cloneCountPropertyId: property.id,
    };
    const pathString = CanvasObjectUtils.cloneCountCanvasPropertyPathToString(ctx.goModule, cloneCountCanvasPropertyPath);
    const result = evaluation.getResult(pathString);
    return result;
  }
}