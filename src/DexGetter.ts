import assert from "assert-ts";
import type { AppState } from "./AppState";
import type { DexProject } from "./DexDomain";
import { Option } from "effect";

export namespace DexGetter {
  export const ProjectEditorHome = {
    getProject: (state: AppState): Option.Option<DexProject> => {
      const activeWindow = state.activeWindow;
      assert(activeWindow._tag === "ProjectEditorHome", "Not in project editor");
      const dexProjectId = state.activeProjectId;

      if (Option.isNone(dexProjectId)) {
        return Option.none();
      }
      const project = state.projects.find((p) => p.id === dexProjectId.value);
      assert(project !== undefined, "Project not found");
      return Option.some(project);
    },
  };
}
