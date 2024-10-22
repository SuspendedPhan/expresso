import assert from "assert-ts";
import type { AppState } from "./AppState";
import type { DexProject } from "./DexDomain";

export namespace DexGetter {
  export const ProjectEditorHome = {
    getProject: (state: AppState): DexProject => {
      const activeWindow = state.activeWindow;
      assert(activeWindow._tag === "ProjectEditorHome", "Not in project editor");
      const project = state.projects.find((p) => p.id === activeWindow.dexProjectId);
      assert(project !== undefined, "Project not found");
      return project;
    }
  };
}
