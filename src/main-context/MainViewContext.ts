import { BehaviorSubject, map } from "rxjs";
import { ElementLayout } from "src/utils/layout/ElementLayout";
import type { NavItem, NavSection } from "src/utils/utils/Nav";
import MainContext from "./MainContext";
import { createCommandCardContext, type CommandCardContext } from "src/utils/utils/CommandCard";

export enum DexWindow {
  ProjectEditor,
  ProjectComponentList,
  ProjectFunctionList,
  LibraryProjectList,
  LibraryComponentList,
  LibraryFunctionList,
  TestView,
}

export enum ViewMode {
  Default,
  MainWindowMaximized,
  CanvasWindowMaximized,
}

export default class MainViewContext {
  public readonly exObjectLayouts$ = new BehaviorSubject<
    readonly ElementLayout[]
  >([]);

  public readonly activeWindow$ = new BehaviorSubject<DexWindow>(DexWindow.TestView);
  // public readonly activeWindow$ = new BehaviorSubject<DexWindow>(DexWindow.ProjectEditor);
  public readonly navCollapsed$ = new BehaviorSubject<boolean>(false);
  public readonly navSections: readonly NavSection[];
  public readonly viewMode$ = new BehaviorSubject<ViewMode>(ViewMode.Default);
  
  public commandCardCtx: CommandCardContext;

  public constructor(ctx: MainContext) {
    this.commandCardCtx = createCommandCardContext(ctx);

    const section0: NavSection = {
      title: "Project",
      navItems: [],
      // focused$: FocusFns.isFocus2Focused$(ctx, Focus2Kind.is.ProjectNav),
    };
    
    const navItems0: NavItem[] = [
      { label: "Editor", window: DexWindow.ProjectEditor, iconClasses: "fa-solid fa-file", section: section0 },
      { label: "Components", window: DexWindow.ProjectComponentList, iconClasses: "fa-solid fa-cube", section: section0 },
      { label: "Functions", window: DexWindow.ProjectFunctionList, iconClasses: "fa-solid fa-code", section: section0 },
      // { label: "TestView", window: DexWindow.TestView, iconClasses: "fa-solid fa-file", section: section0 },
    ];

    (section0 as any).navItems = navItems0;

    const section1: NavSection = {
      title: "Library",
      navItems: [],
      // focused$: FocusFns.isFocus2Focused$(ctx, Focus2Kind.is.LibraryNav),
    };

    const navItems1: NavItem[] = [
      { label: "Projects", window: DexWindow.LibraryProjectList, iconClasses: "fa-solid fa-file", section: section1 },
      { label: "Components", window: DexWindow.LibraryComponentList, iconClasses: "fa-solid fa-cube", section: section1 },
      { label: "Functions", window: DexWindow.LibraryFunctionList, iconClasses: "fa-solid fa-code", section: section1 },
    ];

    (section1 as any).navItems = navItems1;

    this.navSections = [section0, section1];
  }

  public activeWindowEqualTo$(window: DexWindow) {
    return this.activeWindow$.pipe(map((w) => w === window));
  }
}
