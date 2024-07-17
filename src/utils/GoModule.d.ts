import { SceneInstancePath } from "../CloneInstance";

export default interface GoModule {
  addNumberExpr(id: string): void;
  setNumberExprValue(id: string, value: number): void;
  addCallExpr(id: string);
  setCallExprArg0(exprId: string, argId: string): void;
  setCallExprArg1(exprId: string, argId: string): void;
  evalExpr(exprId: string): number;

  eval(): EvaluationMut;
}

export interface Evaluation {
  getResult(attributeId: string, path: SceneInstancePath): number;
}

export interface EvaluationMut extends Evaluation {
  dispose(): void;
}
