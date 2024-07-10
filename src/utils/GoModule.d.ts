export default interface GoModule {
  setValue(id: string, value: number): void;
  addExpr(id: string);
  setExprArg0(exprId: string, argId: string, argType: string): void;
  setExprArg1(exprId: string, argId: string, argType: string): void;
  evalExpr(exprId: string): number;
}

export interface Attribute {
  setExprId(id: string): void;
}

export interface PrimitiveFunctionCallExpr {
  setArgIds(ids: Array<string>);
}
