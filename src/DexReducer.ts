import { HashMap, Option } from "effect";
import { type WritableDraft } from "immer";
import { DexId } from "./DexId";
import { DexNode } from "./DexNode";
import { DexBasicProperty, DexCustomComponent, DexObject, DexObjectId, makeDexObject, type DexProject } from "./DexDomain";


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

// ...

function DexObject_addBlankChild(parent: DexObject) {
  return (project: WritableDraft<DexProject>) => {
    const dexObjectById = makeDexObjectById(project);
    const dParent = HashMap.get(dexObjectById, parent.id);
    const dParent2 = Option.getOrThrow(dParent);
    const newChild = makeDexObject({});
    dParent2.children.push(newChild);
  };
}

function DexObject_setName(dexObject: DexObject) {
  return (project: WritableDraft<DexProject>, name: string) => {
    const dexObjectById = makeDexObjectById(project);
    const dObject = HashMap.get(dexObjectById, dexObject.id);
    const dObject2 = Option.getOrThrow(dObject);
    dObject2.name = name;
  };
}

function DexObject_addDexBasicProperty(dexObject: DexObject, dexBasicProperty: DexBasicProperty) {
  return (project: WritableDraft<DexProject>) => {
    const dexObjectById = makeDexObjectById(project);
    const dObject = HashMap.get(dexObjectById, dexObject.id);
    const dObject2 = Option.getOrThrow(dObject);
    dObject2.dexBasicProperties.push(dexBasicProperty);
  };
}

// ...

