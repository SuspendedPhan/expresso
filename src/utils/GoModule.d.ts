export default interface GoModule {
  addValue(id: string, value: number): void;
  addExpr(id: string, arg0Id: string, arg0Type: string, arg1Id: string, arg1Type: string): void;
  evalExpr(exprId: string): number;
}

export interface Attribute {
  setExprId(id: string): void;
}

export interface PrimitiveFunctionCallExpr {
  setArgIds(ids: Array<string>);
}
