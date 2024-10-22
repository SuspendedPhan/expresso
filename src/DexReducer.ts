import { HashMap, Option } from "effect";
import { type WritableDraft } from "immer";
import { DexId } from "./DexId";
import { DexNode } from "./DexNode";
import { DexBasicProperty, DexCustomComponent, DexCustomComponentParameter, DexFunction, DexFunctionParameter, DexObject, DexObjectId, makeDexCustomComponent, makeDexFunction, makeDexObject, type DexExpr, type DexProject } from "./DexDomain";
import type { AppState } from "./AppState";
import assert from "assert-ts";


export namespace DexReducer {
  export type DexReducer<T> = (state: WritableDraft<T>) => void;

  export const DexProject = {
    setName: DexProject_setName,
    addComponent: DexProject_addComponent,
    addFunction: DexProject_addFunction,
    addObject: DexProject_addObject,
    remove: DexProject_remove,
  }

  export const DexCustomComponent = {
    setName: DexCustomComponent_setName,
    addParameter: DexCustomComponent_addParameter,
    addProperty: DexCustomComponent_addProperty,
    addObject: DexCustomComponent_addObject,
    remove: DexCustomComponent_remove,
  };

  export const DexFunction = {
    setName: DexFunction_setName,
    addParameter: DexFunction_addParameter,
    setExpr: DexFunction_setExpr,
    remove: DexFunction_remove,
  };

  export const DexObject = {
    setName: DexObject_setName,
    addBasicProperty: DexObject_addBasicProperty,
    addChild: DexObject_addChild,
    remove: DexObject_remove,
  };

  export const DexBasicProperty = {
    setName: DexBasicProperty_setName,
    setExpr: DexBasicProperty_setExpr,
    remove: DexBasicProperty_remove,
  };

  export const DexExpr = {
    replace: DexExpr_replace,
  };

  export const DexCustomComponentParameter = {
    setName: DexCustomComponentParameter_setName,
    remove: DexCustomComponentParameter_remove,
  };

  export const DexFunctionParameter = {
    setName: DexFunctionParameter_setName,
    remove: DexFunctionParameter_remove,
  };
}

function makeDexObjectById(project: WritableDraft<DexProject>): HashMap.HashMap<DexObjectId, WritableDraft<DexObject>> {
  const rootDexObjects = project.dexObjects;
  const dexObjects = rootDexObjects.flatMap((o) => Array.from(DexNode.traverse<WritableDraft<DexObject>>(o)));
  const dexObjectById = DexId.makeValueByIdMap<DexObjectId, DexObject>(dexObjects);
  return dexObjectById;
}

function DexProject_setName(name: string) {
  return (project: WritableDraft<DexProject>) => {
    project.name = name;
  };
}

function DexProject_addComponent() {
  return (project: WritableDraft<DexProject>) => {
    const component = makeDexCustomComponent({});
    project.dexComponents.push(component);
  }
}

function DexProject_addFunction() {
  return (project: WritableDraft<DexProject>) => {
    const func = makeDexFunction({});
    project.dexFunctions.push(func);
  }
}

function DexProject_addObject() {
  return (project: WritableDraft<DexProject>) => {
    const obj = makeDexObject({});
    project.dexObjects.push(obj);
  }
}

function DexProject_remove(project: DexProject) {
  return (appState: WritableDraft<AppState>) => {
    const index = appState.projects.findIndex((p) => p.id === project.id);
    assert(index !== -1, "Project not found");
    appState.projects.splice(index, 1);
  }
}

function DexCustomComponent_setName(component: DexCustomComponent, name: string) {
  return (project: WritableDraft<DexProject>) => {
    const dexComponent = project.dexComponents.find((c) => c.id === component.id);
    assert(dexComponent !== undefined, "Component not found");
    dexComponent.name = name;
  };
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
