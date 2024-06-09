export default interface GoModule {
  createAttribute(id: string);
  createNumberExpr(id: string, value: number);
  createPrimitiveFunctionCallExpr(id: string, argIds: Array<string>);
  eval(): number;
}

export interface Attribute {
  setExprId(string: id);
}