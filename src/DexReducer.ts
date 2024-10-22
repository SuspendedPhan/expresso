import { HashMap, Option } from "effect";
import { type WritableDraft } from "immer";
import { DexId } from "./DexId";
import { DexNode } from "./DexNode";
import { DexBasicProperty, DexCustomComponent, DexCustomComponentParameter, DexFunction, DexFunctionParameter, DexObject, DexObjectId, makeDexObject, type DexExpr, type DexProject } from "./DexDomain";


export namespace DexReducer {
  export type DexReducer<T> = (state: WritableDraft<T>) => void;

  export const DexObject = {
    addBlankChild: DexObject_addBlankChild,
  };
}

function makeDexObjectById(project: WritableDraft<DexProject>): HashMap.HashMap<DexObjectId, WritableDraft<DexObject>> {
  const rootDexObjects = project.dexObjects;
  const dexObjects = rootDexObjects.flatMap((o) => Array.from(DexNode.traverse<WritableDraft<DexObject>>(o)));
  const dexObjectById = DexId.makeValueByIdMap(dexObjects);
  return dexObjectById;
}

/*
DexProject
  - setName
  - addComponent
  - addFunction
  - addObject
  - remove

DexCustomComponent
  - setName
  - addParameter
  - addProperty
  - addObject
  - remove

DexFunction
  - setName
  - addParameter
  - setExpr
  - remove

DexObject
  - setName
  - addBasicProperty
  - addChild
  - remove

DexBasicProperty
  - setName
  - setExpr
  - remove

Expr
  - replace

DexCustomComponentParameter
  - setName
  - remove

DexFunctionParameter
  - setName
  - remove


*/

function DexProject_setName(project: DexProject) {
  throw new Error("Not implemented");
}

function DexProject_addComponent(project: DexProject) {
  throw new Error("Not implemented");
}

function DexProject_addFunction(project: DexProject) {
  throw new Error("Not implemented");
}

function DexProject_addObject(project: DexProject) {
  throw new Error("Not implemented");
}

function DexProject_remove(project: DexProject) {
  throw new Error("Not implemented");
}

function DexCustomComponent_setName(component: DexCustomComponent) {
  throw new Error("Not implemented");
}

function DexCustomComponent_addParameter(component: DexCustomComponent) {
  throw new Error("Not implemented");
}

function DexCustomComponent_addProperty(component: DexCustomComponent) {
  throw new Error("Not implemented");
}

function DexCustomComponent_addObject(component: DexCustomComponent) {
  throw new Error("Not implemented");
}

function DexCustomComponent_remove(component: DexCustomComponent) {
  throw new Error("Not implemented");
}

function DexFunction_setName(func: DexFunction) {
  throw new Error("Not implemented");
}

function DexFunction_addParameter(func: DexFunction) {
  throw new Error("Not implemented");
}

function DexFunction_setExpr(func: DexFunction) {
  throw new Error("Not implemented");
}

function DexFunction_remove(func: DexFunction) {
  throw new Error("Not implemented");
}

function DexObject_setName(dexObject: DexObject) {
  return (project: WritableDraft<DexProject>, name: string) => {
    const dexObjectById = makeDexObjectById(project);
    const dObject = HashMap.get(dexObjectById, dexObject.id);
    const dObject2 = Option.getOrThrow(dObject);
    dObject2.name = name;
  };
}

function DexObject_addBasicProperty(dexObject: DexObject, dexBasicProperty: DexBasicProperty) {
  return (project: WritableDraft<DexProject>) => {
    const dexObjectById = makeDexObjectById(project);
    const dObject = HashMap.get(dexObjectById, dexObject.id);
    const dObject2 = Option.getOrThrow(dObject);
    dObject2.dexBasicProperties.push(dexBasicProperty);
  };
}

function DexObject_addChild(dexObject: DexObject) {
  throw new Error("Not implemented");
}

function DexObject_remove(dexObject: DexObject) {
  throw new Error("Not implemented");
}

function DexBasicProperty_setName(property: DexBasicProperty) {
  throw new Error("Not implemented");
}

function DexBasicProperty_setExpr(property: DexBasicProperty) {
  throw new Error("Not implemented");
}

function DexBasicProperty_remove(property: DexBasicProperty) {
  throw new Error("Not implemented");
}

function DexExpr_replace(expr: DexExpr) {
  throw new Error("Not implemented");
}

function DexCustomComponentParameter_setName(parameter: DexCustomComponentParameter) {
  throw new Error("Not implemented");
}

function DexCustomComponentParameter_remove(parameter: DexCustomComponentParameter) {
  throw new Error("Not implemented");
}

function DexFunctionParameter_setName(parameter: DexFunctionParameter) {
  throw new Error("Not implemented");
}

function DexFunctionParameter_remove(parameter: DexFunctionParameter) {
  throw new Error("Not implemented");
}
