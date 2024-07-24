import { BehaviorSubject } from "rxjs";
import { ElementLayout } from "src/utils/layout/ElementLayout";

export enum Window {
  ProjectEditor,
  ProjectFunctionList,
  LibraryProjectList,
  LibraryFunctionList,
}
export default class MainViewContext {
  public readonly componentLayouts$ = new BehaviorSubject<
    readonly ElementLayout[]
  >([]);

  public readonly activeWindow$ = new BehaviorSubject<Window>(Window.ProjectEditor);
}
