import { AttributeCloneInstancePath } from "../CloneInstance";

export default interface GoModule {
  addNumberExpr(id: string): void;
  setNumberExprValue(id: string, value: number): void;
  addCallExpr(id: string);
  setCallExprArg0(exprId: string, argId: string): void;
  setCallExprArg1(exprId: string, argId: string): void;
  evalExpr(exprId: string): number;

  eval(): EvaluationMut;
}

export interface AttributeCloneInstanceEvaluation extends AttributeCloneInstance {
  readonly result: number;
}

export interface Result {
  readonly path: readonly ComponentCloneInstance[];
  readonly value: number;
}

export interface Evaluation {
  getResult(exprId: string): number;
  getResult(attributeId: string, path: AttributeCloneInstancePath): number;
}

export interface EvaluationMut extends Evaluation {
  dispose(): void;
}
