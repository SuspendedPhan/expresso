export default interface GoModule {
  getRootAttributeExprId(): string;
  setRootAttributeId(id: string);

  createAttribute(id: string): Attribute;
  createNumberExpr(id: string, value: number);
  createPrimitiveFunctionCallExpr(id: string): PrimitiveFunctionCallExpr;
  eval(): number;
}

export interface Attribute {
  setExprId(id: string): void;
}

export interface PrimitiveFunctionCallExpr {
  setArgIds(ids: Array<string>);
}
