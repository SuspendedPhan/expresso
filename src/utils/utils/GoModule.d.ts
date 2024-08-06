import { CanvasObjectPath } from "src/scene/CanvasObject";

export default interface GoModule {
  ExObject: {
    create(exObjectId: string): void;
    setCloneCount(exObjectId: string, exprId: string): void;
    addProperty(exObjectId: string, propertyId: string): void;
  };

  Property: {
    setExpr(exObjectId: string, propertyId: string, exprId: string): void;
  };

  NumberExpr: {
    create(id: string): void;
    setValue(id: string, value: number): void;
  };

  CallExpr: {
    create(id: string): void;
    setArg0(exprId: string, argId: string): void;
    setArg1(exprId: string, argId: string): void;
  };

  Evaluator: {
    addRootExObject(id: string): void;
    eval(): EvaluationMut;

    canvasObjectPathAppend(
      basePath: string,
      objectId: string,
      cloneId: string
    ): string;

    createCanvasPropertyPath(
      propertyId: string,
      canvasObjectPath: string
    ): string;

    createCloneCountCanvasPropertyPath(
      parentCanvasObjectPath: string,
      exObjectId: string,
      cloneCountPropertyId: string
    ): string;
  };
}

export interface Evaluation {
  getResult(canvasPropertyPath: string): number;
}

export interface EvaluationMut extends Evaluation {
  dispose(): void;
}
