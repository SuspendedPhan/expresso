export default interface GoModule {
  addNumberExpr(id: string): void;
  setNumberExprValue(id: string, value: number): void;
  addCallExpr(id: string);
  setCallExprArg0(exprId: string, argId: string, argType: string): void;
  setCallExprArg1(exprId: string, argId: string, argType: string): void;
  evalExpr(exprId: string): number;
}

export interface Attribute {
  setExprId(id: string): void;
}

export interface PrimitiveFunctionCallExpr {
  setArgIds(ids: Array<string>);
}
