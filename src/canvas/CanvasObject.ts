import type GoModule from "src/utils/utils/GoModule";

export type CanvasObjectPath = readonly CanvasObjectPathComponent[];

export interface CanvasObjectPathComponent {
  readonly exObjectId: string;
  readonly cloneId: string;
}

export interface CanvasPropertyPath {
  readonly canvasObjectPath: readonly CanvasObjectPathComponent[];
  readonly propertyId: string;
}

export interface CloneCountCanvasPropertyPath {
  readonly parentCanvasObjectPath: CanvasObjectPath;
  readonly exObjectId: string;
  readonly cloneCountPropertyId: string;
}

export namespace CanvasObjectUtils {
  export function canvasObjectPathToString(path: CanvasObjectPath): string {
    let canvasObjectPath = "";
    for (const csi of path) {
      canvasObjectPath += `${csi.exObjectId}:${csi.cloneId}`;
    }
    return canvasObjectPath;
  }

  export function canvasPropertyPathToString(
    goModule: GoModule,
    propertyId: string,
    path: CanvasObjectPath
  ): string {
    const canvasObjectPath = canvasObjectPathToString(path);
    const result = goModule.Evaluator.createCanvasPropertyPath(
      propertyId,
      canvasObjectPath
    );
    return result;
  }

  export function cloneCountCanvasPropertyPathToString(
    goModule: GoModule,
    cloneCountCanvasPropertyPath: CloneCountCanvasPropertyPath
  ): string {
    const { parentCanvasObjectPath, exObjectId, cloneCountPropertyId } =
      cloneCountCanvasPropertyPath;
    const parentPathString = canvasObjectPathToString(parentCanvasObjectPath);
    const result = goModule.Evaluator.createCloneCountCanvasPropertyPath(parentPathString, exObjectId, cloneCountPropertyId);
    return result;
  }
}
