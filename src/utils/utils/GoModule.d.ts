import type { Property } from "src/ex-object/Property";
import { CanvasObjectPath } from "src/scene/CanvasObject";
import type { TypesOf } from "variant";

export default interface GoModule {
  ExFunc: {
    create(id: string): void;
    setExpr(id: string, exprId: string): void;
    setParameters(id: string, parameterIds: string[]): void;
  };

  Component: {
    create(componentId: string): void;
    setRootExObjects(componentId: string, exObjectIds: string[]): void;
  };

  ExObject: {
    create(exObjectId: string): void;
    setCloneCountProperty(exObjectId: string, propertyId: string): void;
    addComponentParameterProperty(exObjectId: string, propertyId: string): void;
    addBasicProperty(exObjectId: string, propertyId: string): void;
  };

  Property: {
    create(propertyId: string): void;
    setExpr(propertyId: string, exprId: string): void;
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

  ReferenceExpr: {
    /**
     * - Property/ComponentParameterProperty
     * - Property/BasicProperty
     * - Property/CloneCountProperty
     * - ComponentParameter/Custom
     * - ExFuncParameter
     */
    create(id: string, targetId: string, targetKind: string): void;
  };

  Evaluator: {
    addRootExObject(id: string): void;
    eval(): Evaluation;
    reset(): void;

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

    debug(): void;
  };
}

export interface Evaluation {
  /**
   * Returns null if there was an error.
   */
  getResult(canvasPropertyPath: string): number | null;
  dispose(): void;
}