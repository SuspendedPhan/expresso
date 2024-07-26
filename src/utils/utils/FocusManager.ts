import { BehaviorSubject, first, map, type Observable, Subject } from "rxjs";
import {
  Component,
  type ExObject,
  ExObjectType,
  type Expr,
  ExprType,
} from "src/ex-object/ExObject";
import { LibraryProject } from "src/library/LibraryProject";
import MainContext from "src/main-context/MainContext";
import { Window } from "src/main-context/MainViewContext";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";
import { assertUnreachable } from "src/utils/utils/Utils";

export type Focus =
  | NoneFocus
  | ExObjectFocus
  | ProjectNavFocus
  | LibraryNavFocus
  | LibraryProjectFocus
  | NewActionsFocus
  | ViewActionsFocus
  | ExprReplaceCommandFocus;

export interface NoneFocus {
  type: "None";
  window: Window;
}

export interface ExObjectFocus {
  type: "ExObject";
  exObject: ExObject;
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

export default class FocusManager {
  private readonly focus$ = new BehaviorSubject<Focus>({
    type: "None",
    window: Window.ProjectEditor,
  });

  public readonly down$ = new Subject<void>();
  public readonly up$ = new Subject<void>();

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

  public isSelected$(object: ExObject): Observable<boolean> {
    return this.focus$.pipe(
      map((focus) => {
        if (focus.type !== "ExObject") {
          return false;
        }
        return focus.exObject === object;
      })
    );
  }

  public focusExObject(exObject: ExObject) {
    this.focus$.next(FocusManager.createExObjectFocus(exObject));
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
      case "ExObject":
        this.downExObject(focus.exObject);
        return;
      default:
        return;
    }
  }

  private downExObject(focus: ExObject) {
    switch (focus.objectType) {
      case ExObjectType.Attribute:
        focus.expr$.pipe(first()).subscribe((expr) => {
          this.focus$.next(FocusManager.createExObjectFocus(expr));
        });
        return;
      case ExObjectType.Expr:
        this.downExpr(focus);
        return;
      case ExObjectType.Component:
        this.downComponent(focus);
        return;
      default:
        assertUnreachable(focus);
    }
  }

  private downComponent(selectedObject: Component) {
    const sceneAttributes = Array.from(
      selectedObject.sceneAttributeByProto.values()
    );
    const attr = sceneAttributes[0];
    if (attr === undefined) {
      throw new Error("Component must have at least 1 attribute");
    }

    this.focus$.next(FocusManager.createExObjectFocus(attr));
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
          this.focus$.next(FocusManager.createExObjectFocus(arg));
        });
        return;
      default:
        assertUnreachable(selectedObject);
    }
  }

  @loggedMethod
  private up(focus: Focus) {
    switch (focus.type) {
      case "ExObject":
        this.upExObject(focus.exObject);
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

  private upExObject(focus: ExObject) {
    const parent$ = focus.parent$;
    parent$.pipe(first()).subscribe((parent) => {
      if (parent !== null) {
        this.focus$.next(FocusManager.createExObjectFocus(parent));
      }
    });
  }

  public left() {
    this.navHorizontal((exObject: ExObject, args: readonly Expr[]) => {
      const index = args.indexOf(exObject as Expr);
      if (index === -1) {
        throw new Error("selectedObject is not in args");
      }

      if (index === args.length - 1) {
        const arg = args[0];
        if (arg === undefined) {
          throw new Error("Index error trying to select first arg");
        }
        this.focus$.next(FocusManager.createExObjectFocus(arg));
      } else {
        const arg = args[index + 1];
        if (arg === undefined) {
          throw new Error("Index error trying to select next arg");
        }
        this.focus$.next(FocusManager.createExObjectFocus(arg));
      }
    });
  }

  public right() {
    this.navHorizontal((focus: ExObject, args: readonly Expr[]) => {
      const index = args.indexOf(focus as Expr);
      if (index === -1) {
        throw new Error("selectedObject is not in args");
      }

      if (index === args.length - 1) {
        const arg = args[0];
        if (arg === undefined) {
          throw new Error("Index error trying to select first arg");
        }
        this.focus$.next(FocusManager.createExObjectFocus(arg));
      } else {
        const arg = args[index + 1];
        if (arg === undefined) {
          throw new Error("Index error trying to select next arg");
        }
        this.focus$.next(FocusManager.createExObjectFocus(arg));
      }
    });
  }

  private navHorizontal(
    navHorizontal1: (focus: ExObject, args: readonly Expr[]) => void
  ) {
    this.focus$.pipe(first()).subscribe((focus) => {
      switch (focus.type) {
        case "ExObject":
          this.navHorizontalExObject(focus, navHorizontal1);
          return;
        default:
          return;
      }
    });
  }
  navHorizontalExObject(
    focus: ExObjectFocus,
    navHorizontal1: (focus: ExObject, args: readonly Expr[]) => void
  ) {
    const exObject = focus.exObject;
    exObject.parent$.pipe(first()).subscribe((parent) => {
      if (parent === null) {
        return;
      }

      if (parent.objectType !== ExObjectType.Expr) {
        return;
      }

      if (parent.exprType !== ExprType.CallExpr) {
        return;
      }

      const args$ = parent.args$;
      args$.pipe(first()).subscribe((args) => {
        navHorizontal1(exObject, args);
      });
    });
  }

  public static createExObjectFocus(exObject: ExObject): ExObjectFocus {
    return { type: "ExObject", exObject, window: Window.ProjectEditor };
  }
}
