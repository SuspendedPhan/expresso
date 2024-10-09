// File: GoModule.d.ts

import type { Property } from "src/ex-object/Property";
import { CanvasObjectPath } from "src/scene/CanvasObject";
import type { TypesOf } from "variant";

export default interface GoModule {
  CustomExFunc: {
    create(id: string): void;
    setExpr(id: string, exprId: string): void;
    setParameters(id: string, parameterIds: string[]): void;
  };

  Component: {
    create(componentId: string): void;
    addParameter(componentId: string, parameterId: string): void;
    addBasicProperty(componentId: string, propertyId: string): void;
    addRootObject(componentId: string, rootObjectId: string): void;
  };

  ExObject: {
    create(exObjectId: string): void;
    setCloneCountProperty(exObjectId: string, propertyId: string): void;
    addComponentParameterProperty(exObjectId: string, propertyId: string): void;
    addBasicProperty(exObjectId: string, propertyId: string): void;
    addChild(exObjectId: string, childId: string): void;
    setCloneNumberTarget(exObjectId: string, cloneNumberTargetId: string): void;
    setComponent(exObjectId: string, componentId: string): void;
  };

  Property: {
    create(propertyId: string): void;
    setExpr(propertyId: string, exprId: string): void;
    setComponentParameterId(
      propertyId: string,
      componentParameterId: string
    ): void;
  };

  NumberExpr: {
    create(id: string): void;
    setValue(id: string, value: number): void;
  };

  CallExpr: {
    create(id: string): void;
    setArgs(id: string, argIds: string[]): void;
    setExFunc(id: string, exFuncId: string): void;
    setExFuncType(id: string, type: string): void;
  };

  ReferenceExpr: {
    create(id: string, targetId: string | null, targetKind: string): void;
    setTargetId(id: string, targetId: string): void;
    setTargetKind(id: string, targetKind: string): void;
  };

  Evaluator: {
    addRootExObject(id: string): void;
    eval(): EvaluationResult;
    reset(): void;

    debug(): void;
  };

  hello(): string;
}

// ObjectInstanceResult
//   exObjectId: string;
//   propertyResults: PropertyInstanceResult[];

// PropertyInstanceResult
//   componentParameterPropertyId: string;
//   value: number;
export interface EvaluationResult {
  getObjectResultCount(): number;
  getPropertyResultCount(objectResultIndex: number): number;

  getPropertyId(objectResultIndex: number, propertyResultIndex: number): string;
  getPropertyValue(
    objectResultIndex: number,
    propertyResultIndex: number
  ): number;

  dispose(): void;
}
