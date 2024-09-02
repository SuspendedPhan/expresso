import { DexWindow } from "src/main-context/MainViewContext";
import LibraryFunctionListView from "src/utils/views/LibraryFunctionListView.svelte";
import LibraryProjectListView from "src/utils/views/LibraryProjectListView.svelte";
import SettingsView from "src/utils/views/SettingsView.svelte";
import EditorView from "../views/EditorView.svelte";
import ProjectComponentListView from "../views/ProjectComponentListView.svelte";
import ProjectExFuncListView from "../views/ProjectExFuncListView.svelte";
import { assertUnreachable } from "./Utils";
import TestView from "src/utils/views/TestView.svelte";

export function activeWindowToSvelteComponent(activeWindow: DexWindow): any {
  switch (activeWindow) {
    case DexWindow.Settings:
      return SettingsView;
    case DexWindow.TestView:
      return TestView;
    case DexWindow.ProjectEditor:
      return EditorView;
    case DexWindow.ProjectComponents:
      return ProjectComponentListView;
    case DexWindow.ProjectFunctionList:
      return ProjectExFuncListView;
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