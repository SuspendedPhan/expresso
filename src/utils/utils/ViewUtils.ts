import { Window } from "src/main-context/MainViewContext";
import LibraryFunctionListView from "src/utils/views/LibraryFunctionListView.svelte";
import LibraryProjectListView from "src/utils/views/LibraryProjectListView.svelte";
import EditorView from "../views/EditorView.svelte";
import ProjectComponentListView from "../views/ProjectComponentListView.svelte";
import ProjectFunctionListView from "../views/ProjectFunctionListView.svelte";
import { assertUnreachable } from "./Utils";

export function activeWindowToSvelteComponent(activeWindow: Window): any {
  switch (activeWindow) {
    case Window.ProjectEditor:
      return EditorView;
    case Window.ProjectComponentList:
      return ProjectComponentListView;
    case Window.ProjectFunctionList:
      return ProjectFunctionListView;
    case Window.LibraryProjectList:
      return LibraryProjectListView;
    case Window.LibraryComponentList:
      return LibraryProjectListView;
    case Window.LibraryFunctionList:
      return LibraryFunctionListView;
    default:
      assertUnreachable(activeWindow);
  }
}

export const Constants = {
  WindowPaddingClass: "p-8",
  WindowPadding: "2rem",
};