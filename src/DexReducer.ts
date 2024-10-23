import assert from "assert-ts";
import { Option } from "effect";

import { type Draft } from "mutative";
import type { AppState, FocusKind } from "./AppState";
import {
  DexBasicProperty,
  DexCustomComponent,
  DexCustomComponentParameter,
  DexFunction,
  DexFunctionParameter,
  DexObject,
  makeDexBasicProperty,
  makeDexCustomComponent,
  makeDexCustomComponentParameter,
  makeDexFunction,
  makeDexFunctionParameter,
  makeDexObject,
  makeDexProject,
  type DexExpr,
  type DexProject,
  type DexProperty,
} from "./DexDomain";
import { DexNode } from "./DexNode";

export namespace DexReducer {
  export type DexReducer<T> = (state: Draft<T>) => void;

  export function fromProjectReducer(reducer: DexReducer<DexProject>): DexReducer<AppState> {
    return (appState: Draft<AppState>) => {
      const activeProjectId = appState.activeProjectId;
      assert(Option.isSome(activeProjectId), "No project selected");
      const project = appState.projects.find((p) => p.id === activeProjectId.value);
      assert(project !== undefined, "Could not find project");
      reducer(project);
    }
  }

  export const AppState = {
    addProject: AppState_addProject,
    setFocus: AppState_setFocus,
  };

  export const DexProject = {
    setName: DexProject_setName,
    addComponent: DexProject_addComponent,
    addFunction: DexProject_addFunction,
    addObject: DexProject_addObject,
    remove: DexProject_remove,
  };

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

function traverseAllDexObjects(project: Draft<DexProject>): Draft<DexObject>[] {
  const result = new Array<DexObject>();
  for (const component of project.components) {
    for (const obj of DexNode.traverseAll(component.objects)) {
      result.push(obj);
    }
  }
  for (const obj of DexNode.traverseAll(project.objects)) {
    result.push(obj);
  }
  return result;
}

function getObjectProperties(object: Draft<DexObject>): Draft<DexProperty>[] {
  const result = new Array<DexProperty>();
  result.push(object.cloneCountProperty);
  result.push(...object.componentParameterProperties);
  result.push(...object.basicProperties);
  return result;
}

function traverseAllProperties(project: Draft<DexProject>): Draft<DexProperty>[] {
  const result = new Array<DexProperty>();
  for (const component of project.components) {
    for (const obj of DexNode.traverseAll(component.objects)) {
      result.push(...getObjectProperties(obj));
    }
  }
  for (const obj of DexNode.traverseAll(project.objects)) {
    result.push(...getObjectProperties(obj));
  }
  return result;
}

function traverseAllDexExprs(project: Draft<DexProject>): Draft<DexExpr>[] {
  const result = new Array<DexExpr>();
  for (const property of traverseAllProperties(project)) {
    result.push(property.expr);
  }
  for (const func of project.functions) {
    result.push(func.expr);
  }
  return result;
}

function DexProject_setName(name: string) {
  return (project: Draft<DexProject>) => {
    project.name = name;
  };
}

// --- Reducers ---

function AppState_addProject() {
  return (appState: Draft<AppState>) => {
    const project = makeDexProject({});
    appState.projects.push(project);
    appState.activeProjectId = Option.some(project.id);
  };
}

function AppState_setFocus(kind: FocusKind, targetId: string) {
  return (appState: Draft<AppState>) => {
    appState.focus = Option.some({
      _tag: "DexFocus",
      kind,
      targetId,
      isEditing: false,
    });
  };
}

function DexProject_addComponent() {
  return (project: Draft<DexProject>) => {
    const component = makeDexCustomComponent({});
    project.components.push(component);
  };
}

function DexProject_addFunction() {
  return (project: Draft<DexProject>) => {
    const func = makeDexFunction({});
    project.functions.push(func);
  };
}

function DexProject_addObject() {
  return (project: Draft<DexProject>) => {
    const obj = makeDexObject({});
    project.objects.push(obj);
  };
}

function DexProject_remove(project: DexProject) {
  return (appState: Draft<AppState>) => {
    const index = appState.projects.findIndex((p) => p.id === project.id);
    assert(index !== -1, "Project not found");
    appState.projects.splice(index, 1);
  };
}

function DexCustomComponent_setName(component: DexCustomComponent, name: string) {
  return (project: Draft<DexProject>) => {
    const dexComponent = project.components.find((c) => c.id === component.id);
    assert(dexComponent !== undefined, "Component not found");
    dexComponent.name = name;
  };
}

function DexCustomComponent_addParameter(component: DexCustomComponent) {
  return (project: Draft<DexProject>) => {
    const dexComponent = project.components.find((c) => c.id === component.id);
    assert(dexComponent !== undefined, "Component not found");
    const parameter = makeDexCustomComponentParameter({});
    dexComponent.parameters.push(parameter);
  };
}

function DexCustomComponent_addProperty(component: DexCustomComponent) {
  return (project: Draft<DexProject>) => {
    const dexComponent = project.components.find((c) => c.id === component.id);
    assert(dexComponent !== undefined, "Component not found");
    const property = makeDexBasicProperty({});
    dexComponent.properties.push(property);
  };
}

function DexCustomComponent_addObject(component: DexCustomComponent) {
  return (project: Draft<DexProject>) => {
    const dexComponent = project.components.find((c) => c.id === component.id);
    assert(dexComponent !== undefined, "Component not found");
    const obj = makeDexObject({});
    dexComponent.objects.push(obj);
  };
}

function DexCustomComponent_remove(component: DexCustomComponent) {
  return (project: Draft<DexProject>) => {
    const index = project.components.findIndex((c) => c.id === component.id);
    assert(index !== -1, "Component not found");
    project.components.splice(index, 1);
  };
}

function DexFunction_setName(func: DexFunction) {
  return (project: Draft<DexProject>, name: string) => {
    const dexFunction = project.functions.find((f) => f.id === func.id);
    assert(dexFunction !== undefined, "Function not found");
    dexFunction.name = name;
  };
}

function DexFunction_addParameter(func: DexFunction) {
  return (project: Draft<DexProject>) => {
    const dexFunction = project.functions.find((f) => f.id === func.id);
    assert(dexFunction !== undefined, "Function not found");
    const parameter = makeDexFunctionParameter({});
    dexFunction.parameters.push(parameter);
  };
}

function DexFunction_setExpr(func: DexFunction) {
  return (project: Draft<DexProject>, expr: DexExpr) => {
    const dexFunction = project.functions.find((f) => f.id === func.id);
    assert(dexFunction !== undefined, "Function not found");
    dexFunction.expr = expr;
  };
}

function DexFunction_remove(func: DexFunction) {
  return (project: Draft<DexProject>) => {
    const index = project.functions.findIndex((f) => f.id === func.id);
    assert(index !== -1, "Function not found");
    project.functions.splice(index, 1);
  };
}

function DexObject_setName(dexObject: DexObject, name: string) {
  return (project: Draft<DexProject>) => {
    const object = traverseAllDexObjects(project).find((o) => o.id === dexObject.id);
    assert(object !== undefined, "Object not found");
    object.name = name;
  };
}

function DexObject_addBasicProperty(dexObject: DexObject) {
  return (project: Draft<DexProject>) => {
    const object = traverseAllDexObjects(project).find((o) => o.id === dexObject.id);
    assert(object !== undefined, "Object not found");
    const property = makeDexBasicProperty({});
    object.basicProperties.push(property);
  };
}

function DexObject_addChild(dexObject: DexObject) {
  return (project: Draft<DexProject>) => {
    const object = traverseAllDexObjects(project).find((o) => o.id === dexObject.id);
    assert(object !== undefined, "Object not found");
    const child = makeDexObject({});
    object.children.push(child);
  };
}

function DexObject_remove(dexObject: DexObject) {
  return (project: Draft<DexProject>) => {
    const object = traverseAllDexObjects(project).find((o) => o.id === dexObject.id);
    assert(object !== undefined, "Object not found");
    const parent = traverseAllDexObjects(project).find((o) => o.children.includes(object));
    assert(parent !== undefined, "Parent not found");
    parent.children.splice(parent.children.indexOf(object), 1);
  };
}

function DexBasicProperty_setName(property: DexBasicProperty) {
  return (project: Draft<DexProject>, name: string) => {
    const object = traverseAllDexObjects(project).find((o) => o.basicProperties.includes(property));
    assert(object !== undefined, "Object not found");
    const property2 = object.basicProperties.find((p) => p.id === property.id);
    assert(property2 !== undefined, "Property not found");
    property2.name = name;
  };
}

function DexBasicProperty_setExpr(property: DexBasicProperty) {
  return (project: Draft<DexProject>, expr: DexExpr) => {
    const object = traverseAllDexObjects(project).find((o) => o.basicProperties.includes(property));
    assert(object !== undefined, "Object not found");
    const property2 = object.basicProperties.find((p) => p.id === property.id);
    assert(property2 !== undefined, "Property not found");
    property2.expr = expr;
  };
}

function DexBasicProperty_remove(property: DexBasicProperty) {
  return (project: Draft<DexProject>) => {
    const object = traverseAllDexObjects(project).find((o) => o.basicProperties.includes(property));
    assert(object !== undefined, "Object not found");
    const property2 = object.basicProperties.find((p) => p.id === property.id);
    assert(property2 !== undefined, "Property not found");
    object.basicProperties.splice(object.basicProperties.indexOf(property2), 1);
  };
}

function DexExpr_replace(oldExpr: DexExpr, newExpr: DexExpr) {
  return (project: Draft<DexProject>) => {
    for (const property of traverseAllProperties(project)) {
      if (property.expr === oldExpr) {
        property.expr = newExpr;
        return;
      }
    }
    for (const func of project.functions) {
      if (func.expr === oldExpr) {
        func.expr = newExpr;
        return;
      }
    }

    const parentExpr = traverseAllDexExprs(project).find((expr) => expr.children.includes(oldExpr));
    assert(parentExpr !== undefined, "Parent not found");
    parentExpr.children.splice(parentExpr.children.indexOf(oldExpr), 1, newExpr);
  };
}

function DexCustomComponentParameter_setName(parameter: DexCustomComponentParameter) {
  return (project: Draft<DexProject>, name: string) => {
    const component = project.components.find((c) => c.parameters.includes(parameter));
    assert(component !== undefined, "Component not found");
    const parameter2 = component.parameters.find((p) => p.id === parameter.id);
    assert(parameter2 !== undefined, "Parameter not found");
    parameter2.name = name;
  };
}

function DexCustomComponentParameter_remove(parameter: DexCustomComponentParameter) {
  return (project: Draft<DexProject>) => {
    const component = project.components.find((c) => c.parameters.includes(parameter));
    assert(component !== undefined, "Component not found");
    const parameter2 = component.parameters.find((p) => p.id === parameter.id);
    assert(parameter2 !== undefined, "Parameter not found");
    component.parameters.splice(component.parameters.indexOf(parameter2), 1);
  };
}

function DexFunctionParameter_setName(parameter: DexFunctionParameter) {
  return (project: Draft<DexProject>, name: string) => {
    const func = project.functions.find((f) => f.parameters.includes(parameter));
    assert(func !== undefined, "Function not found");
    const parameter2 = func.parameters.find((p) => p.id === parameter.id);
    assert(parameter2 !== undefined, "Parameter not found");
    parameter2.name = name;
  };
}

function DexFunctionParameter_remove(parameter: DexFunctionParameter) {
  return (project: Draft<DexProject>) => {
    const func = project.functions.find((f) => f.parameters.includes(parameter));
    assert(func !== undefined, "Function not found");
    const parameter2 = func.parameters.find((p) => p.id === parameter.id);
    assert(parameter2 !== undefined, "Parameter not found");
    func.parameters.splice(func.parameters.indexOf(parameter2), 1);
  };
}
