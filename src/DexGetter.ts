import assert from "assert-ts";
import type { AppState, FocusKind } from "./AppState";
import type { DexProject } from "./DexDomain";
import { Option } from "effect";

export namespace DexGetter {
  export const ProjectEditorHome = {
    getProject: (state: AppState): DexProject | null => {
      const activeWindow = state.activeWindow;
      assert(activeWindow._tag === "ProjectEditorHome", "Not in project editor");
      const dexProjectId = state.activeProjectId;

      if (Option.isNone(dexProjectId)) {
        return null;
      }
      const project = state.projects.find((p) => p.id === dexProjectId.value);
      assert(project !== undefined, "Project not found");
      return project;
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
}
