import {
  BehaviorSubject,
  first,
  Observable,
  of,
  Subject,
  switchAll,
  take,
} from "rxjs";
import {
  ExObject,
  ExObjectType,
  Expr,
  ExprType,
} from "../ExprFactory";
import ExprManager from "../ExprManager";
import { loggedMethod } from "../logger/LoggerDecorator";
import { assertUnreachable } from "./Utils";

export type Selectable = ExObject | null;

export default class Selection {
  private readonly selectedObject$$ = new BehaviorSubject<
    Observable<Selectable>
  >(of(null));
  private readonly root$$ = new BehaviorSubject<Observable<Selectable>>(of(null));
  public readonly root$ = this.root$$.pipe(switchAll());
  public readonly down$ = new Subject<void>();
  public readonly up$ = new Subject<void>();

  public constructor(private exprManager: ExprManager) {
    this.down$.subscribe(() => {
      this.getSelectedObject$().pipe(first()).subscribe((selectedObject) => {
        this.down(selectedObject);
      });
    });
    this.up$.subscribe(() => {
      this.getSelectedObject$().pipe(first()).subscribe((selectedObject) => {
        this.up(selectedObject);
      });
    });
  }

  public getSelectedObject$(): Observable<Selectable> {
    return this.selectedObject$$.pipe(switchAll());
  }

  public setRoot$(selectable$: Observable<Selectable>) {
    this.root$$.next(selectable$);
  }

  public select(object: Selectable) {
    if (object === null) {
      this.selectedObject$$.next(of(null));
      return;
    }
    const object$ = this.exprManager.getObject$(object);
    this.selectedObject$$.next(object$);
  }

  @loggedMethod
  public down(selectedObject: Selectable) {
    if (selectedObject === null) {
      this.selectedObject$$.next(this.root$);
      return;
    }

    switch (selectedObject.objectType) {
      case ExObjectType.Attribute:
        selectedObject.expr$.pipe(take(1)).subscribe((expr) => {
          this.exprManager.getObject$(expr);
        });
        return;
      case ExObjectType.Expr:
        this.downExpr(selectedObject);
        return;
      default:
        assertUnreachable(selectedObject);
    }
  }

  private downExpr(selectedObject: Expr) {
    switch (selectedObject.exprType) {
      case ExprType.NumberExpr:
        return;
      case ExprType.CallExpr:
        if (selectedObject.args[0] === undefined) {
          throw new Error("CallExpr must have at least 1 args");
        }
        const arg$ = selectedObject.args[0];
        this.selectedObject$$.next(arg$);
        return;
      default:
        assertUnreachable(selectedObject);
    }
  }

  private up(selectedObject: Selectable) {
    if (selectedObject === null) {
      return;
    }

    switch (selectedObject.objectType) {
      case ExObjectType.Attribute:
        return;
      case ExObjectType.Expr:
        this.upExpr(selectedObject);
        return;
      default:
        assertUnreachable(selectedObject);
    }
  }

  private upExpr(selectedObject: Expr) {
    const parent$ = this.exprManager.getParent$(selectedObject);
    this.selectedObject$$.next(parent$);
  }
}
