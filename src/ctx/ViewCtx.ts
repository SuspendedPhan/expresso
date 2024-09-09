import { Effect, Layer } from "effect";
import { BehaviorSubject, map } from "rxjs";
import type { ElementLayout } from "src/utils/layout/ElementLayout";
import type { NavItem, NavSection } from "src/utils/utils/Nav";
import type { DexEffectSuccess } from "src/utils/utils/Utils";

export enum DexWindow {
  ProjectEditor,
  ProjectComponents,
  ProjectFunctionList,
  LibraryProjectList,
  LibraryComponentList,
  LibraryFunctionList,
  TestView,
  Settings,
}

export enum ViewMode {
  Default,
  MainWindowMaximized,
  CanvasWindowMaximized,
}

export class ViewCtx extends Effect.Tag("ViewCtx")<
  ViewCtx,
  DexEffectSuccess<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const section0: NavSection = {
    title: "Project",
    navItems: [],
  };

  const navItems0: NavItem[] = [
    {
      label: "Editor",
      window: DexWindow.ProjectEditor,
      iconClasses: "fa-solid fa-file",
      section: section0,
    },
    {
      label: "Components",
      window: DexWindow.ProjectComponents,
      iconClasses: "fa-solid fa-cube",
      section: section0,
    },
    {
      label: "Functions",
      window: DexWindow.ProjectFunctionList,
      iconClasses: "fa-solid fa-code",
      section: section0,
    },
    // { label: "TestView", window: DexWindow.TestView, iconClasses: "fa-solid fa-file", section: section0 },
  ];

  const section1: NavSection = {
    title: "Library",
    navItems: [],
  };

  const navItems1: NavItem[] = [
    {
      label: "Projects",
      window: DexWindow.LibraryProjectList,
      iconClasses: "fa-solid fa-file",
      section: section1,
    },
    {
      label: "Components",
      window: DexWindow.LibraryComponentList,
      iconClasses: "fa-solid fa-cube",
      section: section1,
    },
    {
      label: "Functions",
      window: DexWindow.LibraryFunctionList,
      iconClasses: "fa-solid fa-code",
      section: section1,
    },
  ];

  const section2: NavSection = {
    title: "",
    navItems: [],
  };

  const navItems2: NavItem[] = [
    {
      label: "Settings",
      window: DexWindow.Settings,
      iconClasses: "fa-solid fa-gears",
      section: section2,
    },
  ];

  (section0 as any).navItems = navItems0;
  (section1 as any).navItems = navItems1;
  (section2 as any).navItems = navItems2;

  return {
    exObjectLayouts$: new BehaviorSubject<ElementLayout[]>([]),
    activeWindow$: new BehaviorSubject<DexWindow>(DexWindow.ProjectEditor),
    navCollapsed$: new BehaviorSubject<boolean>(false),
    navSections: [section0, section1, section2],
    viewMode$: ViewMode.Default,

    activeWindowEqualTo$(window: DexWindow) {
        return this.activeWindow$.pipe(map((w) => w === window));
      }
  };
});

export const ViewCtxLive = Layer.effect(ViewCtx, ctxEffect);
