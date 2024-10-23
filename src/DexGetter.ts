import assert from "assert-ts";
import { Option } from "effect";
import type { AppState } from "./AppState";
import type { DexExpr, DexObject, DexProject, DexProperty } from "./DexDomain";
import type { FocusKind } from "./DexFocus";
import { DexNode } from "./DexNode";

function traverseAllDexObjects(project: DexProject): DexObject[] {
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

function getObjectProperties(object: DexObject): DexProperty[] {
  const result = new Array<DexProperty>();
  result.push(object.cloneCountProperty);
  result.push(...object.componentParameterProperties);
  result.push(...object.basicProperties);
  return result;
}

function traverseAllProperties(project: DexProject): DexProperty[] {
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

function traverseAllDexExprs(project: DexProject): DexExpr[] {
  const result = new Array<DexExpr>();
  for (const property of traverseAllProperties(project)) {
    result.push(property.expr);
  }
  for (const func of project.functions) {
    result.push(func.expr);
  }
  return result;
}

export namespace DexGetter {
  export const ProjectEditorHome = {
    getProject: (state: AppState): DexProject | null => {
      const dexProjectId = state.activeProjectId;

      if (Option.isNone(dexProjectId)) {
        return null;
      }
      const project = state.projects.find((p) => p.id === dexProjectId.value);
      assert(project !== undefined, "Project not found");
      return project;
    },
  };

  export const DexObject = {
    get: (state: AppState, targetId: string) => {
      const project = ProjectEditorHome.getProject(state);
      assert(project !== null, "Project not found");
      const dexObject = traverseAllDexObjects(project).find((obj) => obj.id === targetId);
      assert(dexObject !== undefined, "Object not found");
      return dexObject;
    },
  };

  export const DexBasicProperty = {
    get: (state: AppState, targetId: string) => {
      const project = ProjectEditorHome.getProject(state);
      assert(project !== null, "Project not found");
      const dexProperty = traverseAllProperties(project).find((prop) => prop.id === targetId);
      assert(dexProperty !== undefined, "Property not found");
      assert(dexProperty._tag === "DexBasicProperty", "Property is not basic");
      return dexProperty;
    },
  };

  export function isEditing(state: AppState, kind: FocusKind, targetId: string): boolean {
    const focus = state.focus;
    if (Option.isNone(focus)) {
      return false;
    }
    return focus.value.kind === kind && focus.value.targetId === targetId && focus.value.isEditing;
  }

  export function isFocused(state: AppState, kind: FocusKind, targetId: string): boolean {
    const focus = state.focus;
    if (Option.isNone(focus)) {
      return false;
    }
    return focus.value.kind === kind && focus.value.targetId === targetId;
  }

  export function getActiveProject(state: AppState): Option.Option<DexProject> {
    const dexProjectId = state.activeProjectId;

    if (Option.isNone(dexProjectId)) {
      return Option.none();
    }
    const project = state.projects.find((p) => p.id === dexProjectId.value);
    assert(project !== undefined, "Project not found");
    return Option.some(project);
  }
}
