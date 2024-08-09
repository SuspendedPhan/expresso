import { BehaviorSubject, first, map, type Observable, Subject } from "rxjs";
import type { ExObject } from "src/ex-object/ExObject";
import { type ExItem, type Expr, ExItemType, ExprType } from "src/ex-object/ExItem";
import type { LibraryProject } from "src/library/LibraryProject";
import MainContext from "src/main-context/MainContext";
import { Window } from "src/main-context/MainViewContext";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";
import { assertUnreachable } from "src/utils/utils/Utils";
import type { Property } from "src/ex-object/Property";

export type Focus =
  | NoneFocus
  | ExItemFocus
  | ProjectNavFocus
  | LibraryNavFocus
  | LibraryProjectFocus
  | NewActionsFocus
  | ViewActionsFocus
  | ExprReplaceCommandFocus
  | EditPropertyNameFocus
  ;

export interface NoneFocus {
  type: "None";
  window: Window;
}

export interface ExItemFocus {
  type: "ExItem";
  exItem: ExItem;
  window: Window.ProjectEditor;
}

export interface ProjectNavFocus {
  type: "ProjectNav";
  window: Window;
}

export interface LibraryNavFocus {
  type: "LibraryNav";
  window: Window;
}

export interface LibraryProjectFocus {
  type: "LibraryProject";
  project: LibraryProject;
  window: Window.LibraryProjectList;
}

export interface NewActionsFocus {
  type: "NewActions";
  window: Window.ProjectEditor;
}

export interface ViewActionsFocus {
  type: "ViewActions";
  window: Window;
}

export interface ExprReplaceCommandFocus {
  type: "ExprReplaceCommand";
  expr: Expr;
  window: Window.ProjectEditor;
}

export interface EditPropertyNameFocus {
  type: "EditPropertyName";
  property: Property;
  window: Window.ProjectEditor;
}

export default class FocusManager {
  private readonly focus$ = new BehaviorSubject<Focus>({
    type: "None",
    window: Window.ProjectEditor,
  });

  public readonly down$ = new Subject<void>();
  public readonly up$ = new Subject<void>();
  public readonly isEditing$ = this.focus$.pipe(
    map((focus) => focus.type === "EditPropertyName")
  );

  public constructor(private readonly ctx: MainContext) {
    this.down$.subscribe(() => {
      this.getFocus$()
        .pipe(first())
        .subscribe((selectedObject) => {
          this.down(selectedObject);
        });
    });
    this.up$.subscribe(() => {
      this.getFocus$()
        .pipe(first())
        .subscribe((selectedObject) => {
          this.up(selectedObject);
        });
    });
  }

  public getFocus$(): Observable<Focus> {
    return this.focus$;
  }

  public isSelected$(object: ExItem): Observable<boolean> {
    return this.focus$.pipe(
      map((focus) => {
        if (focus.type !== "ExItem") {
          return false;
        }
        return focus.exItem === object;
      })
    );
  }

  public focus(focus: Focus) {
    this.focus$.next(focus);
  }

  public focusExItem(exItem: ExItem) {
    this.focus$.next(FocusManager.createExItemFocus(exItem));
  }

  public focusProjectNav() {
    this.ctx.viewCtx.activeWindow$.pipe(first()).subscribe((window) => {
      this.focus$.next({ type: "ProjectNav", window });
    });
  }

  public focusLibraryNav() {
    this.ctx.viewCtx.activeWindow$.pipe(first()).subscribe((window) => {
      this.focus$.next({ type: "LibraryNav", window });
    });
  }

  public focusLibraryProject(project: LibraryProject) {
    this.focus$.next({
      type: "LibraryProject",
      project,
      window: Window.LibraryProjectList,
    });
  }

  public focusNone() {
    this.ctx.viewCtx.activeWindow$.pipe(first()).subscribe((window) => {
      this.focus$.next({ type: "None", window });
    });
  }

  public focusNewActions() {
    this.focus$.next({ type: "NewActions", window: Window.ProjectEditor });
  }

  public focusViewActions() {
    this.ctx.viewCtx.activeWindow$.pipe(first()).subscribe((window) => {
      this.focus$.next({ type: "ViewActions", window });
    });
  }

  public focusExprReplaceCommand(expr: Expr) {
    this.focus$.next({
      type: "ExprReplaceCommand",
      expr,
      window: Window.ProjectEditor,
    });
  }

  public popFocus() {
    this.focusNone();
  }

  @loggedMethod
  private down(focus: Focus) {
    if (focus.window === Window.LibraryProjectList) {
      this.ctx.projectManager.navDown(focus);
      return;
    }

    switch (focus.type) {
      case "ExItem":
        this.downExItem(focus.exItem);
        return;
      default:
        return;
    }
  }

  private downExItem(focus: ExItem) {
    switch (focus.itemType) {
      case ExItemType.Property:
        focus.expr$.pipe(first()).subscribe((expr) => {
          this.focus$.next(FocusManager.createExItemFocus(expr));
        });
        return;
      case ExItemType.Expr:
        this.downExpr(focus);
        return;
      case ExItemType.ExObject:
        this.downExObject(focus);
        return;
      default:
        assertUnreachable(focus);
    }
  }

  private downExObject(selectedObject: ExObject) {
    const sceneAttributes = Array.from(
      selectedObject.componentParameterProperties
    );
    const attr = sceneAttributes[0];
    if (attr === undefined) {
      throw new Error("ExObject must have at least 1 attribute");
    }

    this.focus$.next(FocusManager.createExItemFocus(attr));
  }

  @loggedMethod
  private downExpr(selectedObject: Expr) {
    switch (selectedObject.exprType) {
      case ExprType.NumberExpr:
        return;
      case ExprType.CallExpr:
        const args$ = selectedObject.args$;
        args$.pipe(first()).subscribe((args) => {
          const arg = args[0];
          if (arg === undefined) {
            throw new Error("CallExpr must have at least 1 args");
          }
          this.focus$.next(FocusManager.createExItemFocus(arg));
        });
        return;
      default:
        assertUnreachable(selectedObject);
    }
  }

  @loggedMethod
  private up(focus: Focus) {
    switch (focus.type) {
      case "ExItem":
        this.upExItem(focus.exItem);
        return;
      case "LibraryProject":
        this.ctx.projectManager
          .getPrevProject$(focus.project)
          .pipe(first())
          .subscribe((project) => {
            this.focus$.next({
              type: "LibraryProject",
              project,
              window: Window.LibraryProjectList,
            });
          });
        return;
      default:
        return;
    }
  }

  private upExItem(focus: ExItem) {
    const parent$ = focus.parent$;
    parent$.pipe(first()).subscribe((parent) => {
      if (parent !== null) {
        this.focus$.next(FocusManager.createExItemFocus(parent));
      }
    });
  }

  public left() {
    this.navHorizontal((exItem: ExItem, args: readonly Expr[]) => {
      const index = args.indexOf(exItem as Expr);
      if (index === -1) {
        throw new Error("selectedObject is not in args");
      }

      if (index === args.length - 1) {
        const arg = args[0];
        if (arg === undefined) {
          throw new Error("Index error trying to select first arg");
        }
        this.focus$.next(FocusManager.createExItemFocus(arg));
      } else {
        const arg = args[index + 1];
        if (arg === undefined) {
          throw new Error("Index error trying to select next arg");
        }
        this.focus$.next(FocusManager.createExItemFocus(arg));
      }
    });
  }

  public right() {
    this.navHorizontal((focus: ExItem, args: readonly Expr[]) => {
      const index = args.indexOf(focus as Expr);
      if (index === -1) {
        throw new Error("selectedObject is not in args");
      }

      if (index === args.length - 1) {
        const arg = args[0];
        if (arg === undefined) {
          throw new Error("Index error trying to select first arg");
        }
        this.focus$.next(FocusManager.createExItemFocus(arg));
      } else {
        const arg = args[index + 1];
        if (arg === undefined) {
          throw new Error("Index error trying to select next arg");
        }
        this.focus$.next(FocusManager.createExItemFocus(arg));
      }
    });
  }

  private navHorizontal(
    navHorizontal1: (focus: ExItem, args: readonly Expr[]) => void
  ) {
    this.focus$.pipe(first()).subscribe((focus) => {
      switch (focus.type) {
        case "ExItem":
          this.navHorizontalExItem(focus, navHorizontal1);
          return;
        default:
          return;
      }
    });
  }
  navHorizontalExItem(
    focus: ExItemFocus,
    navHorizontal1: (focus: ExItem, args: readonly Expr[]) => void
  ) {
    const exItem = focus.exItem;
    exItem.parent$.pipe(first()).subscribe((parent) => {
      if (parent === null) {
        return;
      }

      if (parent.itemType !== ExItemType.Expr) {
        return;
      }

      if (parent.exprType !== ExprType.CallExpr) {
        return;
      }

      const args$ = parent.args$;
      args$.pipe(first()).subscribe((args) => {
        navHorizontal1(exItem, args);
      });
    });
  }

  public static createExItemFocus(exItem: ExItem): ExItemFocus {
    return { type: "ExItem", exItem: exItem, window: Window.ProjectEditor };
  }
}
