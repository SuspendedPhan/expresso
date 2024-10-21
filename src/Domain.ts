// --- Core types ---

export interface DexCustomComponent {
  readonly name: string;
  readonly dexCustomComponentParameters: DexCustomComponentParameter[];
  readonly dexProperties: DexBasicProperty[];
  readonly dexObjects: DexObject[];
}

export interface DexCanvasComponent {
  readonly name: string;
  readonly dexCanvasComponentParameters: DexCanvasComponentParameter[];
}

export interface DexFunction {
  readonly _tag: "DexFunction";
}

export interface DexObject {
  readonly _tag: "DexObject";
  readonly name: string;
  readonly children: DexObject[];
}

export type DexProperty = DexCloneCountProperty | DexComponentParameterProperty | DexBasicProperty;

export interface DexCloneCountProperty extends DexPropertyBase {
  readonly _tag: "DexCloneCountProperty";
  readonly count: number;
}

export interface DexComponentParameterProperty extends DexPropertyBase {
  readonly _tag: "DexComponentParameterProperty";
  readonly dexComponentParameter: DexComponentParameter;
}

export interface DexBasicProperty extends DexPropertyBase {
  readonly _tag: "DexBasicProperty";
  readonly name: string;
}

export type DexExpr = DexNumberExpr | DexCallExpr | DexReferenceExpr;

export interface DexNumberExpr {
  readonly _tag: "NumberExpr";
  readonly value: number;
}

export interface DexCallExpr {
  readonly _tag: "CallExpr";
  readonly dexFunction: DexFunction;
  readonly args: DexExpr[];
}

export interface DexReferenceExpr {
  readonly _tag: "ReferenceExpr";
  readonly target: DexReferenceTarget;
}

// --- Secondary types ---

export interface DexGlobalProperty {}

export type DexComponentParameter = DexCustomComponentParameter | DexCanvasComponentParameter;
export type DexComponent = DexCustomComponent | DexCanvasComponent;

export interface DexCustomComponentParameter {
  readonly _tag: "DexCustomComponentParameter";
  readonly name: string;
}

export interface DexCanvasComponentParameter {
  readonly _tag: "DexCanvasComponentParameter";
  readonly name: string;
}

export interface DexFunctionParameter {
  readonly _tag: "DexFunctionParameter";
}

export interface DexCloneNumberTarget {
  readonly _tag: "DexCloneNumberTarget";
}

export interface DexPropertyBase {
  expr: DexExpr;
}

export type DexReferenceTarget =
  | DexProperty
  | DexComponentParameter
  | DexFunctionParameter
  | DexCloneNumberTarget
  | DexGlobalProperty;

