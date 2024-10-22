// --- Core types ---

import { Brand, Data } from "effect";

export interface DexProject {
  readonly _tag: "DexProject";
  readonly name: string;
  readonly dexComponents: DexComponent[];
  readonly dexFunctions: DexFunction[];
  readonly dexObjects: DexObject[];

  readonly dexObjectOrdinal: number;
}

export interface DexCustomComponent {
  readonly _tag: "DexCustomComponent";
  readonly name: string;
  readonly dexCustomComponentParameters: DexCustomComponentParameter[];
  readonly dexProperties: DexBasicProperty[];
  readonly dexObjects: DexObject[];
}

export interface DexCanvasComponent {
  readonly _tag: "DexCanvasComponent";
  readonly name: string;
  readonly dexCanvasComponentParameters: DexCanvasComponentParameter[];
}

export interface DexFunction {
  readonly _tag: "DexFunction";
}

export interface DexObject {
  readonly _tag: "DexObject";
  readonly id: DexObjectId;
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

export const DexProject = Data.tagged<DexProject>("DexProject");
export const DexCustomComponent = Data.tagged<DexCustomComponent>("DexCustomComponent");
export const DexCanvasComponent = Data.tagged<DexCanvasComponent>("DexCanvasComponent");
export const DexFunction = Data.tagged<DexFunction>("DexFunction");
export const DexObject = Data.tagged<DexObject>("DexObject");
export const DexCloneCountProperty = Data.tagged<DexCloneCountProperty>("DexCloneCountProperty");
export const DexComponentParameterProperty = Data.tagged<DexComponentParameterProperty>(
  "DexComponentParameterProperty"
);
export const DexBasicProperty = Data.tagged<DexBasicProperty>("DexBasicProperty");
export const DexNumberExpr = Data.tagged<DexNumberExpr>("NumberExpr");
export const DexCallExpr = Data.tagged<DexCallExpr>("CallExpr");
export const DexReferenceExpr = Data.tagged<DexReferenceExpr>("ReferenceExpr");
export const DexCustomComponentParameter = Data.tagged<DexCustomComponentParameter>("DexCustomComponentParameter");
export const DexCanvasComponentParameter = Data.tagged<DexCanvasComponentParameter>("DexCanvasComponentParameter");
export const DexFunctionParameter = Data.tagged<DexFunctionParameter>("DexFunctionParameter");
export const DexCloneNumberTarget = Data.tagged<DexCloneNumberTarget>("DexCloneNumberTarget");

// --- IDs ---

export type DexObjectId = string & Brand.Brand<"DexObjectId">;
export const DexObjectId = Brand.nominal<DexObjectId>();

export type PartialCaseArgs<T extends (...args: any) => any> = Partial<Parameters<T>["0"]>
export type CaseArgs<T extends (...args: any) => any> = Parameters<T>["0"];

export function makeDexProject(args: PartialCaseArgs<typeof DexProject>): DexProject {
  const args2: CaseArgs<typeof DexProject> = {
    name: args.name ?? "Untitled Project",
    dexComponents: args.dexComponents ?? [],
    dexFunctions: args.dexFunctions ?? [],
    dexObjects: args.dexObjects ?? [],
    dexObjectOrdinal: args.dexObjectOrdinal ?? 0,
  }
  return DexProject(args2);
}