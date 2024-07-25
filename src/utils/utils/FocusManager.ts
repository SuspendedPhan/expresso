import { BehaviorSubject, first, map, type Observable, Subject } from "rxjs";
import {
  Component,
  type ExObject,
  ExObjectType,
  type Expr,
  ExprType,
} from "src/ex-object/ExObject";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";
import { assertUnreachable } from "src/utils/utils/Utils";

type Focus = NoneFocus | ExObjectFocus | ProjectNavFocus;

interface NoneFocus {
  type: "None";
}

interface ExObjectFocus {
  type: "ExObject";
  exObject: ExObject;
}

interface ProjectNavFocus {
  type: "ProjectNav";
}

export default class FocusManager {
  private readonly focus$ = new BehaviorSubject<Focus>({ type: "None" });

  public readonly down$ = new Subject<void>();
  public readonly up$ = new Subject<void>();

  public constructor() {
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

  @loggedMethod
  public debug() {
    // const logger = Logger.logger();
    // this.getFocus$().subscribe((selectedObject) => {
    //   logger.log("selectedObject", (selectedObject as any).id ?? "null");
    // });
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

  public focus(object: Focus) {
    this.focus$.next(object);
  }

  @loggedMethod
  private down(focus: Focus) {
    // const logger = Logger.logger();

    switch (focus.type) {
      case "None":
        return;
      case "ExObject":
        this.downExObject(focus.exObject);
        return;
      case "ProjectNav":
        return;
      default:
        assertUnreachable(focus);
    }
  }

  private downExObject(focus: ExObject) {
    switch (focus.objectType) {
      case ExObjectType.Attribute:
        focus.expr$.pipe(first()).subscribe((expr) => {
          this.focus$.next({ type: "ExObject", exObject: expr });
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

  downComponent(selectedObject: Component) {
    const sceneAttributes = Array.from(
      selectedObject.sceneAttributeByProto.values()
    );
    const attr = sceneAttributes[0];
    if (attr === undefined) {
      throw new Error("Component must have at least 1 attribute");
    }

    this.focus$.next({ type: "ExObject", exObject: attr });
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
          this.focus$.next({ type: "ExObject", exObject: arg });
        });
        return;
      default:
        assertUnreachable(selectedObject);
    }
  }

  @loggedMethod
  private up(focus: Focus) {
    switch (focus.type) {
      case "None":
        return;
      case "ExObject":
        this.upExObject(focus.exObject);
        return;
      case "ProjectNav":
        return;
      default:
        assertUnreachable(focus);
    }
  }

  private upExObject(focus: ExObject) {
    const parent$ = focus.parent$;
    parent$.pipe(first()).subscribe((parent) => {
      if (parent !== null) {
        this.focus$.next({ type: "ExObject", exObject: parent });
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
        this.focus$.next({ type: "ExObject", exObject: arg });
      } else {
        const arg = args[index + 1];
        if (arg === undefined) {
          throw new Error("Index error trying to select next arg");
        }
        this.focus$.next({ type: "ExObject", exObject: arg });
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
        this.focus$.next({ type: "ExObject", exObject: arg });
      } else {
        const arg = args[index + 1];
        if (arg === undefined) {
          throw new Error("Index error trying to select next arg");
        }
        this.focus$.next({ type: "ExObject", exObject: arg });
      }
    });
  }

  private navHorizontal(
    navHorizontal1: (focus: ExObject, args: readonly Expr[]) => void
  ) {
    this.focus$.pipe(first()).subscribe((focus) => {
      switch (focus.type) {
        case "None":
          return;
        case "ExObject":
          this.navHorizontalExObject(focus, navHorizontal1);
          return;
        case "ProjectNav":
          return;
        default:
          assertUnreachable(focus);
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
}
