import { BehaviorSubject } from "rxjs";
import { ElementLayout } from "src/utils/layout/ElementLayout";

export enum Window {
  ProjectEditor,
  ProjectComponentList,
  ProjectFunctionList,
  LibraryProjectList,
  LibraryComponentList,
  LibraryFunctionList,
}
export default class MainViewContext {
  public readonly componentLayouts$ = new BehaviorSubject<
    readonly ElementLayout[]
  >([]);

  public readonly activeWindow$ = new BehaviorSubject<Window>(Window.ProjectEditor);
  public readonly navCollapsed$ = new BehaviorSubject<boolean>(false);
}
