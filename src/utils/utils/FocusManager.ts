import assert from "assert-ts";
import {
  BehaviorSubject,
  first,
  firstValueFrom,
  map,
  type Observable,
  Subject,
} from "rxjs";
import {
  type ExItem,
  ExItemType,
  type Expr,
  ExprType,
} from "src/ex-object/ExItem";
import { type Property, PropertyType } from "src/ex-object/Property";
import type { LibraryProject } from "src/library/LibraryProject";
import MainContext from "src/main-context/MainContext";
import { DexWindow } from "src/main-context/MainViewContext";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";
import { ExObjectFocus, FocusBase } from "src/utils/utils/Focus";
import { type ProjectComponentListFocus } from "src/utils/utils/KeyboardComponentList";
import { assertUnreachable } from "src/utils/utils/Utils";
import unionize, { ofType, type UnionOf } from "unionize";

export type Focus =
  | ExItemFocus
  | LibraryProjectFocus
  | ExprReplaceCommandFocus
  | EditPropertyNameFocus
  | FocusBase
  | Focus2Wrapper;

export const Focus2Union = unionize({
  None: {},
  ProjectNav: {},
  LibraryNav: {},
  EditorNewActions: {},
  ViewActions: {},
  ProjectComponentList: ofType<{ pclFocus: ProjectComponentListFocus }>(),
});

export type Focus2 = UnionOf<typeof Focus2Union>;

export interface Focus2Wrapper {
  type: "Focus2";
  focus2: Focus2;
}

export interface ExItemFocus {
  type: "ExItem";
  exItem: ExItem;
}

export interface LibraryProjectFocus {
  type: "LibraryProject";
  project: LibraryProject;
}
export interface ExprReplaceCommandFocus {
  type: "ExprReplaceCommand";
  expr: Expr;
}

export interface EditPropertyNameFocus {
  type: "EditPropertyName";
  property: Property;
}

export default class FocusManager {
  private readonly focus$ = new BehaviorSubject<Focus>({
    type: "Focus2",
    focus2: Focus2Union.None(),
  });

  public readonly down$ = new Subject<void>();
  public readonly up$ = new Subject<void>();
  public readonly isEditing$ = this.focus$.pipe(
    map((focus) => {
      if (focus instanceof FocusBase) {
        return focus.isEditing;
      }

      return (
        focus.type === "EditPropertyName" || focus.type === "ExprReplaceCommand"
      );
    })
  );

  private readonly focusStack = new Array<Focus>();

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
    this.focusStack.push(focus);
    this.focus$.next(focus);
  }

  public focusNone() {
    this.focus({ type: "Focus2", focus2: Focus2Union.None() });
  }

  public focusExItem(exItem: ExItem) {
    this.focus(FocusManager.createExItemFocus(exItem));
  }

  public focusProjectNav() {
    this.focus({ type: "Focus2", focus2: Focus2Union.ProjectNav() });
  }

  public focusLibraryNav() {
    this.focus({ type: "Focus2", focus2: Focus2Union.LibraryNav() });
  }

  public focusLibraryProject(project: LibraryProject) {
    this.focus({
      type: "LibraryProject",
      project,
    });
  }

  public focusExprReplaceCommand(expr: Expr) {
    this.focus({
      type: "ExprReplaceCommand",
      expr,
    });
  }

  public popFocus() {
    this.focusStack.pop();
    if (this.focusStack.length === 0) {
      this.focus$.next({ type: "Focus2", focus2: Focus2Union.None() });
    } else {
      this.focus$.next(this.focusStack[this.focusStack.length - 1]!);
    }
  }

  @loggedMethod
  private async down(focus: Focus) {
    const activeWindow = await firstValueFrom(this.ctx.viewCtx.activeWindow$);
    if (activeWindow === DexWindow.LibraryProjectList) {
      this.ctx.projectManager.navDown(focus);
      return;
    }

    switch (focus.type) {
      case "Focus2":
        if (Focus2Union.is.None(focus.focus2)) {
          this.downNone();
        }
        return;
      case "ExItem":
        this.downExItem(focus.exItem);
        return;
      default:
        this.downMisc(focus);
        return;
    }
  }

  private async downMisc(focus: Focus) {
    if (focus instanceof ExObjectFocus.Name) {
      this.focus(
        new ExObjectFocus.Component({
          exObject: focus.exObject,
          isEditing: false,
        })
      );
    } else if (focus instanceof ExObjectFocus.Component) {
      this.focusExItem(focus.exObject.cloneCountProperty);
    }
  }

  private async upMisc(focus: Focus) {
    if (focus instanceof ExObjectFocus.Name) {
      this.focusExItem(focus.exObject);
    } else if (focus instanceof ExObjectFocus.Component) {
      this.focus(
        new ExObjectFocus.Name({
          exObject: focus.exObject,
          isEditing: false,
        })
      );
    }
  }

  private async downNone() {
    const project = await firstValueFrom(
      this.ctx.projectManager.currentProject$
    );
    const objs = await firstValueFrom(project.rootExObjects$);
    const obj = objs[0];
    if (obj === undefined) {
      return;
    }
    this.focus(FocusManager.createExItemFocus(obj));
  }

  private downExItem(focus: ExItem) {
    switch (focus.itemType) {
      case ExItemType.ExObject:
        this.focus(
          new ExObjectFocus.Name({
            exObject: focus,
            isEditing: false,
          })
        );
        return;
      case ExItemType.Property:
        focus.expr$.pipe(first()).subscribe((expr) => {
          this.focus(FocusManager.createExItemFocus(expr));
        });
        return;
      case ExItemType.Expr:
        this.downExpr(focus);
        return;
      default:
        assertUnreachable(focus);
    }
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
          this.focus(FocusManager.createExItemFocus(arg));
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
            this.focus({
              type: "LibraryProject",
              project,
            });
          });
        return;
      default:
        this.upMisc(focus);
        return;
    }
  }

  private async upExItem(focus: ExItem) {
    const parent = await firstValueFrom(focus.parent$);
    if (
      focus.itemType === ExItemType.Property &&
      focus.propertyType === PropertyType.CloneCountProperty
    ) {
      assert(parent !== null, "parent is null");
      assert(parent.itemType === ExItemType.ExObject, "parent is not ExObject");
      this.focus(
        new ExObjectFocus.Component({ exObject: parent, isEditing: false })
      );
      return;
    }

    const parent$ = focus.parent$;
    parent$.pipe(first()).subscribe((parent) => {
      if (parent !== null) {
        this.focus(FocusManager.createExItemFocus(parent));
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
        this.focus(FocusManager.createExItemFocus(arg));
      } else {
        const arg = args[index + 1];
        if (arg === undefined) {
          throw new Error("Index error trying to select next arg");
        }
        this.focus(FocusManager.createExItemFocus(arg));
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
        this.focus(FocusManager.createExItemFocus(arg));
      } else {
        const arg = args[index + 1];
        if (arg === undefined) {
          throw new Error("Index error trying to select next arg");
        }
        this.focus(FocusManager.createExItemFocus(arg));
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
    return {
      type: "ExItem",
      exItem,
    };
  }
}
