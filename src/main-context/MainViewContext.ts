import { BehaviorSubject, map } from "rxjs";
import { ElementLayout } from "src/utils/layout/ElementLayout";
import MainContext from "./MainContext";
import { NavItem, NavSection } from "src/utils/utils/NavUtils";

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
  public readonly navSections: readonly NavSection[];

  public constructor(ctx: MainContext) {
    const section0: NavSection = {
      title: "Projects",
      navItems: [],
      focused$: ctx.focusManager.getFocus$().pipe(map((f) => f.type === "ProjectNav")),
    };
    
    const navItems0: NavItem[] = [
      { label: "Editor", window: Window.ProjectEditor, iconClasses: "fa-solid fa-file", section: section0 },
      { label: "Components", window: Window.ProjectComponentList, iconClasses: "fa-solid fa-cube", section: section0 },
      { label: "Functions", window: Window.ProjectFunctionList, iconClasses: "fa-solid fa-cogs", section: section0 },
    ];

    (section0 as any).navItems = navItems0;

    const section1: NavSection = {
      title: "Libraries",
      navItems: [],
      focused$: ctx.focusManager.getFocus$().pipe(map((f) => f.type === "LibraryNav")),
    };

    const navItems1: NavItem[] = [
      { label: "Projects", window: Window.LibraryProjectList, iconClasses: "fa-solid fa-file", section: section1 },
      { label: "Components", window: Window.LibraryComponentList, iconClasses: "fa-solid fa-cube", section: section1 },
      { label: "Functions", window: Window.LibraryFunctionList, iconClasses: "fa-solid fa-cogs", section: section1 },
    ];

    (section1 as any).navItems = navItems1;

    this.navSections = [section0, section1];
  }
}
