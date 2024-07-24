import { Window } from "src/main-context/MainViewContext";
import { assertUnreachable } from "./Utils";

export function activeWindowToSvelteComponent(activeWindow: Window): any {
  switch (activeWindow) {
    case Window.ProjectEditor:
      return import("src/utils/views/EditorView.svelte");
    case Window.ProjectFunctionList:
      return import("src/utils/views/ProjectFunctionListView.svelte");
    case Window.LibraryProjectList:
      return import("src/utils/views/LibraryProjectListView.svelte");
    case Window.LibraryFunctionList:
      return import("src/utils/views/LibraryFunctionListView.svelte");
    default:
      assertUnreachable(activeWindow);
  }
}
