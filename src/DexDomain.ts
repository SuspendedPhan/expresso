// --- Core types ---

import assert from "assert-ts";
import { DexData } from "./DexData";
import { DexId } from "./DexId";

export interface DexProject {
  readonly _tag: "DexProject";
  readonly id: string;
  readonly name: string;
  readonly components: DexCustomComponent[];
  readonly functions: DexFunction[];
  readonly objects: DexObject[];

  readonly dexObjectOrdinal: number;
}

export interface DexCustomComponent {
  readonly _tag: "DexCustomComponent";
  readonly id: string;
  readonly name: string;
  readonly parameters: DexCustomComponentParameter[];
  readonly properties: DexBasicProperty[];
  readonly objects: DexObject[];
}

export interface DexCanvasComponent {
  readonly _tag: "DexCanvasComponent";
  readonly id: string;
  readonly name: string;
  readonly parameters: DexCanvasComponentParameter[];
}

export interface DexFunction {
  readonly _tag: "DexFunction";
  readonly id: string;
  readonly name: string;
  readonly parameters: DexFunctionParameter[];
  readonly expr: DexExpr;
}

export interface DexObject {
  readonly _tag: "DexObject";
  readonly id: string;
  readonly name: string;
  readonly cloneCountProperty: DexCloneCountProperty;
  readonly componentParameterProperties: DexComponentParameterProperty[];
  readonly basicProperties: DexBasicProperty[];
  readonly cloneNumberTarget: DexCloneNumberTarget;
  readonly children: DexObject[];
}

export type DexProperty = DexCloneCountProperty | DexComponentParameterProperty | DexBasicProperty;

export interface DexCloneCountProperty extends DexPropertyBase {
  readonly _tag: "DexCloneCountProperty";
  readonly id: string;
}

export interface DexComponentParameterProperty extends DexPropertyBase {
  readonly _tag: "DexComponentParameterProperty";
  readonly id: string;
  readonly parameter: DexComponentParameter;
}

export interface DexBasicProperty extends DexPropertyBase {
  readonly _tag: "DexBasicProperty";
  readonly id: string;
  readonly name: string;
}

export type DexExpr = DexNumberExpr | DexCallExpr | DexReferenceExpr;

export interface DexNumberExpr extends DexExprBase {
  readonly _tag: "NumberExpr";
  readonly id: string;
  readonly value: number;
}

export interface DexCallExpr extends DexExprBase {
  readonly _tag: "CallExpr";
  readonly id: string;
  readonly function: DexFunction;
}

export interface DexReferenceExpr extends DexExprBase {
  readonly _tag: "ReferenceExpr";
  readonly id: string;
  readonly target: DexReferenceTarget;
}

export interface DexExprBase {
  readonly children: DexExpr[];
}

// --- Secondary types ---

export interface DexGlobalProperty {
  readonly id: string;
}

export type DexComponentParameter = DexCustomComponentParameter | DexCanvasComponentParameter;
export type DexComponent = DexCustomComponent | DexCanvasComponent;

export interface DexCustomComponentParameter {
  readonly _tag: "DexCustomComponentParameter";
  readonly id: string;
  readonly name: string;
}

export interface DexCanvasComponentParameter {
  readonly _tag: "DexCanvasComponentParameter";
  readonly id: string;
  readonly name: string;
}

export interface DexFunctionParameter {
  readonly _tag: "DexFunctionParameter";
  readonly id: string;
  readonly name: string;
}

export interface DexCloneNumberTarget {
  readonly _tag: "DexCloneNumberTarget";
  readonly id: string;
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

export const DexProject = DexData.tagged<DexProject>("DexProject");
export const DexCustomComponent = DexData.tagged<DexCustomComponent>("DexCustomComponent");
export const DexCanvasComponent = DexData.tagged<DexCanvasComponent>("DexCanvasComponent");
export const DexFunction = DexData.tagged<DexFunction>("DexFunction");
export const DexObject = DexData.tagged<DexObject>("DexObject");
export const DexCloneCountProperty = DexData.tagged<DexCloneCountProperty>("DexCloneCountProperty");
export const DexComponentParameterProperty = DexData.tagged<DexComponentParameterProperty>(
  "DexComponentParameterProperty"
);
export const DexBasicProperty = DexData.tagged<DexBasicProperty>("DexBasicProperty");
export const DexNumberExpr = DexData.tagged<DexNumberExpr>("NumberExpr");
export const DexCallExpr = DexData.tagged<DexCallExpr>("CallExpr");
export const DexReferenceExpr = DexData.tagged<DexReferenceExpr>("ReferenceExpr");
export const DexCustomComponentParameter = DexData.tagged<DexCustomComponentParameter>("DexCustomComponentParameter");
export const DexCanvasComponentParameter = DexData.tagged<DexCanvasComponentParameter>("DexCanvasComponentParameter");
export const DexFunctionParameter = DexData.tagged<DexFunctionParameter>("DexFunctionParameter");
export const DexCloneNumberTarget = DexData.tagged<DexCloneNumberTarget>("DexCloneNumberTarget");

// --- Constructors ---

export type PartialCaseArgs<T extends (...args: any) => any> = Partial<Parameters<T>["0"]>;
export type CaseArgs<T extends (...args: any) => any> = Parameters<T>["0"];

export function makeDexProject(args: PartialCaseArgs<typeof DexProject>): DexProject {
  const args2: CaseArgs<typeof DexProject> = {
    id: args.id ?? DexId.make(),
    name: args.name ?? "Untitled Project",
    components: args.components ?? [],
    functions: args.functions ?? [],
    objects: args.objects ?? [],
    dexObjectOrdinal: args.dexObjectOrdinal ?? 0,
  };
  return DexProject(args2);
}

export function makeDexCustomComponent(args: PartialCaseArgs<typeof DexCustomComponent>): DexCustomComponent {
  const args2: CaseArgs<typeof DexCustomComponent> = {
    id: args.id ?? DexId.make(),
    name: args.name ?? "Untitled Custom Component",
    parameters: args.parameters ?? [],
    properties: args.properties ?? [],
    objects: args.objects ?? [],
  };
  return DexCustomComponent(args2);
}

export function makeDexCanvasComponent(args: PartialCaseArgs<typeof DexCanvasComponent>): DexCanvasComponent {
  const args2: CaseArgs<typeof DexCanvasComponent> = {
    id: args.id ?? DexId.make(),
    name: args.name ?? "Untitled Canvas Component",
    parameters: args.parameters ?? [],
  };
  return DexCanvasComponent(args2);
}

export function makeDexFunction(args: PartialCaseArgs<typeof DexFunction>): DexFunction {
  const args2: CaseArgs<typeof DexFunction> = {
    id: args.id ?? DexId.make(),
    name: args.name ?? "Untitled Function",
    parameters: args.parameters ?? [],
    expr: args.expr ?? makeDexNumberExpr({}),
  };
  return DexFunction(args2);
}

export function makeDexObject(args: PartialCaseArgs<typeof DexObject>): DexObject {
  const args2: CaseArgs<typeof DexObject> = {
    id: args.id ?? DexId.make(),
    name: args.name ?? "Untitled Object",
    cloneCountProperty: args.cloneCountProperty ?? makeDexCloneCountProperty({}),
    componentParameterProperties: args.componentParameterProperties ?? [],
    basicProperties: args.basicProperties ?? [],
    cloneNumberTarget: args.cloneNumberTarget ?? makeDexCloneNumberTarget({}),
    children: args.children ?? [],
  };
  return DexObject(args2);
}

export function makeDexCloneCountProperty(args: PartialCaseArgs<typeof DexCloneCountProperty>): DexCloneCountProperty {
  const args2: CaseArgs<typeof DexCloneCountProperty> = {
    id: args.id ?? DexId.make(),
    expr: args.expr ?? makeDexNumberExpr({ value: 1 }),
  };
  return DexCloneCountProperty(args2);
}

export function makeDexComponentParameterProperty(
  args: PartialCaseArgs<typeof DexComponentParameterProperty>
): DexComponentParameterProperty {
  assert(args.parameter !== undefined, "dexComponentParameter is required");
  const args2: CaseArgs<typeof DexComponentParameterProperty> = {
    id: args.id ?? DexId.make(),
    expr: args.expr ?? makeDexNumberExpr({}),
    parameter: args.parameter,
  };
  return DexComponentParameterProperty(args2);
}

export function makeDexBasicProperty(args: PartialCaseArgs<typeof DexBasicProperty>): DexBasicProperty {
  const args2: CaseArgs<typeof DexBasicProperty> = {
    id: args.id ?? DexId.make(),
    expr: args.expr ?? makeDexNumberExpr({}),
    name: args.name ?? "Untitled Property",
  };
  return DexBasicProperty(args2);
}

export function makeDexNumberExpr(args: PartialCaseArgs<typeof DexNumberExpr>): DexNumberExpr {
  assert(args.children === undefined, "children is not allowed");
  const args2: CaseArgs<typeof DexNumberExpr> = {
    id: args.id ?? DexId.make(),
    value: args.value ?? 0,
    children: [],
  };
  return DexNumberExpr(args2);
}

export function makeDexCallExpr(args: PartialCaseArgs<typeof DexCallExpr>): DexCallExpr {
  assert(args.function !== undefined, "dexFunction is required");
  assert(args.children !== undefined, "args is required");
  const args2: CaseArgs<typeof DexCallExpr> = {
    id: args.id ?? DexId.make(),
    function: args.function,
    children: args.children,
  };
  return DexCallExpr(args2);
}

export function makeDexReferenceExpr(args: PartialCaseArgs<typeof DexReferenceExpr>): DexReferenceExpr {
  assert(args.target !== undefined, "target is required");
  assert(args.children === undefined, "children is not allowed");
  const args2: CaseArgs<typeof DexReferenceExpr> = {
    id: args.id ?? DexId.make(),
    target: args.target,
    children: [],
  };
  return DexReferenceExpr(args2);
}

export function makeDexCustomComponentParameter(
  args: PartialCaseArgs<typeof DexCustomComponentParameter>
): DexCustomComponentParameter {
  const args2: CaseArgs<typeof DexCustomComponentParameter> = {
    id: args.id ?? DexId.make(),
    name: args.name ?? "Untitled Custom Component Parameter",
  };
  return DexCustomComponentParameter(args2);
}

export function makeDexCanvasComponentParameter(
  args: PartialCaseArgs<typeof DexCanvasComponentParameter>
): DexCanvasComponentParameter {
  const args2: CaseArgs<typeof DexCanvasComponentParameter> = {
    id: args.id ?? DexId.make(),
    name: args.name ?? "Untitled Canvas Component Parameter",
  };
  return DexCanvasComponentParameter(args2);
}

export function makeDexFunctionParameter(args: PartialCaseArgs<typeof DexFunctionParameter>): DexFunctionParameter {
  const args2: CaseArgs<typeof DexFunctionParameter> = {
    id: args.id ?? DexId.make(),
    name: args.name ?? "Untitled Function Parameter",
  };
  return DexFunctionParameter(args2);
}

export function makeDexCloneNumberTarget(args: PartialCaseArgs<typeof DexCloneNumberTarget>): DexCloneNumberTarget {
  const args2: CaseArgs<typeof DexCloneNumberTarget> = {
    id: args.id ?? DexId.make(),
  };
  return DexCloneNumberTarget(args2);
}
