import { DexWindow } from "src/main-context/MainViewContext";
import LibraryFunctionListView from "src/utils/views/LibraryFunctionListView.svelte";
import LibraryProjectListView from "src/utils/views/LibraryProjectListView.svelte";
import EditorView from "../views/EditorView.svelte";
import ProjectComponentListView from "../views/ProjectComponentListView.svelte";
import ProjectFunctionListView from "../views/ProjectFunctionListView.svelte";
import { assertUnreachable } from "./Utils";

export function activeWindowToSvelteComponent(activeWindow: DexWindow): any {
  switch (activeWindow) {
    case DexWindow.ProjectEditor:
      return EditorView;
    case DexWindow.ProjectComponentList:
      return ProjectComponentListView;
    case DexWindow.ProjectFunctionList:
      return ProjectFunctionListView;
    case DexWindow.LibraryProjectList:
      return LibraryProjectListView;
    case DexWindow.LibraryComponentList:
      return LibraryProjectListView;
    case DexWindow.LibraryFunctionList:
      return LibraryFunctionListView;
    default:
      assertUnreachable(activeWindow);
  }
}

export const Constants = {
  WindowPaddingClass: "p-8",
  WindowPadding: "2rem",
};