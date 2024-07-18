import { SceneInstancePath } from "../SceneInstance";

export default interface GoModule {
  Component: {
    create(componentId: string): void;
    setCloneCount(componentId: string, count: number): void;
    addAttribute(componentId: string, attributeId: string): void;
  };

  Attribute: {
    setExpr(componentId: string, attributeId: string, exprId: string): void;
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
    eval(): EvaluationMut;
    sceneInstancePathAppend(
      basePath: string,
      componentId: string,
      cloneId: string
    ): string;
    createAttributeSceneInstancePath(
      attributeId: string,
      sceneInstancePath: string
    ): string;
  };
}

export interface Evaluation {
  getResult(attributeSceneInstancePath: string): number;
}

export interface EvaluationMut extends Evaluation {
  dispose(): void;
}
