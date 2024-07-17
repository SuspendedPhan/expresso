import { SceneInstancePath } from "../CloneInstance";

export default interface GoModule {
  addNumberExpr(id: string): void;
  setNumberExprValue(id: string, value: number): void;
  addCallExpr(id: string);
  setCallExprArg0(exprId: string, argId: string): void;
  setCallExprArg1(exprId: string, argId: string): void;
  evalExpr(exprId: string): number;

  eval(): EvaluationMut;
  
  sceneInstancePathAppend(basePath: string, componentId: string, cloneId: string): string;
  createAttributeSceneInstancePath(attributeId: string, sceneInstancePath: string): string;
}

export interface Evaluation {
  getResult(attributeId: string, sceneInstancePath: string): number;
}

export interface EvaluationMut extends Evaluation {
  dispose(): void;
}
