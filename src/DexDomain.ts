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
  readonly _tag: "DexNumberExpr";
  readonly id: string;
  readonly value: number;
}

export interface DexCallExpr extends DexExprBase {
  readonly _tag: "DexCallExpr";
  readonly id: string;
  readonly function: DexFunction;
}

export interface DexReferenceExpr extends DexExprBase {
  readonly _tag: "DexReferenceExpr";
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


// --- Constructors ---

export type PartialCaseArgs<T extends (...args: any) => any> = Partial<Parameters<T>["0"]>;
export type CaseArgs<T extends (...args: any) => any> = Parameters<T>["0"];

export function makeDexProject(args: Partial<DexProject>): DexProject {
  const args2: DexProject = {
    _tag: "DexProject",
    id: args.id ?? DexId.make(),
    name: args.name ?? "Untitled Project",
    components: args.components ?? [],
    functions: args.functions ?? [],
    objects: args.objects ?? [],
    dexObjectOrdinal: args.dexObjectOrdinal ?? 0,
  };
  return args2;
}

export function makeDexCustomComponent(args: Partial<DexCustomComponent>): DexCustomComponent {
  const args2: DexCustomComponent = {
    _tag: "DexCustomComponent",
    id: args.id ?? DexId.make(),
    name: args.name ?? "Untitled Custom Component",
    parameters: args.parameters ?? [],
    properties: args.properties ?? [],
    objects: args.objects ?? [],
  };
  return args2;
}

export function makeDexCanvasComponent(args: Partial<DexCanvasComponent>): DexCanvasComponent {
  const args2: DexCanvasComponent = {
    _tag: "DexCanvasComponent",
    id: args.id ?? DexId.make(),
    name: args.name ?? "Untitled Canvas Component",
    parameters: args.parameters ?? [],
  };
  return args2;
}

export function makeDexFunction(args: Partial<DexFunction>): DexFunction {
  const args2: DexFunction = {
    _tag: "DexFunction",
    id: args.id ?? DexId.make(),
    name: args.name ?? "Untitled Function",
    parameters: args.parameters ?? [],
    expr: args.expr ?? makeDexNumberExpr({}),
  };
  return args2;
}

export function makeDexObject(args: Partial<DexObject>): DexObject {
  const args2: DexObject = {
    _tag: "DexObject",
    id: args.id ?? DexId.make(),
    name: args.name ?? "Untitled Object",
    cloneCountProperty: args.cloneCountProperty ?? makeDexCloneCountProperty({}),
    componentParameterProperties: args.componentParameterProperties ?? [],
    basicProperties: args.basicProperties ?? [],
    cloneNumberTarget: args.cloneNumberTarget ?? makeDexCloneNumberTarget({}),
    children: args.children ?? [],
  };
  return args2;
}

export function makeDexCloneCountProperty(args: Partial<DexCloneCountProperty>): DexCloneCountProperty {
  const args2: DexCloneCountProperty = {
    _tag: "DexCloneCountProperty",
    id: args.id ?? DexId.make(),
    expr: args.expr ?? makeDexNumberExpr({ value: 1 }),
  };
  return args2;
}

export function makeDexComponentParameterProperty(
  args: Partial<DexComponentParameterProperty>
): DexComponentParameterProperty {
  assert(args.parameter !== undefined, "dexComponentParameter is required");
  const args2: DexComponentParameterProperty = {
    _tag: "DexComponentParameterProperty",
    id: args.id ?? DexId.make(),
    expr: args.expr ?? makeDexNumberExpr({}),
    parameter: args.parameter,
  };
  return args2;
}

export function makeDexBasicProperty(args: Partial<DexBasicProperty>): DexBasicProperty {
  const args2: DexBasicProperty = {
    _tag: "DexBasicProperty",
    id: args.id ?? DexId.make(),
    expr: args.expr ?? makeDexNumberExpr({}),
    name: args.name ?? "Untitled Property",
  };
  return args2;
}

export function makeDexNumberExpr(args: Partial<DexNumberExpr>): DexNumberExpr {
  assert(args.children === undefined, "children is not allowed");
  const args2: DexNumberExpr = {
    _tag: "DexNumberExpr",
    id: args.id ?? DexId.make(),
    value: args.value ?? 0,
    children: [],
  };
  return args2;
}

export function makeDexCallExpr(args: Partial<DexCallExpr>): DexCallExpr {
  assert(args.function !== undefined, "dexFunction is required");
  assert(args.children !== undefined, "args is required");
  const args2: DexCallExpr = {
    _tag: "DexCallExpr",
    id: args.id ?? DexId.make(),
    function: args.function,
    children: args.children,
  };
  return args2;
}

export function makeDexReferenceExpr(args: Partial<DexReferenceExpr>): DexReferenceExpr {
  assert(args.target !== undefined, "target is required");
  assert(args.children === undefined, "children is not allowed");
  const args2: DexReferenceExpr = {
    _tag: "DexReferenceExpr",
    id: args.id ?? DexId.make(),
    target: args.target,
    children: [],
  };
  return args2;
}

export function makeDexCustomComponentParameter(
  args: Partial<DexCustomComponentParameter>
): DexCustomComponentParameter {
  const args2: DexCustomComponentParameter = {
    _tag: "DexCustomComponentParameter",
    id: args.id ?? DexId.make(),
    name: args.name ?? "Untitled Custom Component Parameter",
  };
  return args2;
}

export function makeDexCanvasComponentParameter(
  args: Partial<DexCanvasComponentParameter>
): DexCanvasComponentParameter {
  const args2: DexCanvasComponentParameter = {
    _tag: "DexCanvasComponentParameter",
    id: args.id ?? DexId.make(),
    name: args.name ?? "Untitled Canvas Component Parameter",
  };
  return args2;
}

export function makeDexFunctionParameter(args: Partial<DexFunctionParameter>): DexFunctionParameter {
  const args2: DexFunctionParameter = {
    _tag: "DexFunctionParameter",
    id: args.id ?? DexId.make(),
    name: args.name ?? "Untitled Function Parameter",
  };
  return args2;
}

export function makeDexCloneNumberTarget(args: Partial<DexCloneNumberTarget>): DexCloneNumberTarget {
  const args2: DexCloneNumberTarget = {
    _tag: "DexCloneNumberTarget",
    id: args.id ?? DexId.make(),
  };
  return args2;
}
