import {
  BehaviorSubject,
  first,
  Observable,
  of,
  Subject,
  switchAll
} from "rxjs";
import { ExObject, ExObjectType, Expr, ExprType } from "../ExObjectFactory";
import ExObjectManager from "../ExObjectManager";
import Logger from "../logger/Logger";
import { loggedMethod } from "../logger/LoggerDecorator";
import { assertUnreachable } from "./Utils";

export type Selectable = ExObject | null;

export default class Selection {
  private readonly selectedObject$$ = new BehaviorSubject<
    Observable<Selectable>
  >(of(null));
  private readonly root$$ = new BehaviorSubject<Observable<Selectable>>(
    of(null)
  );
  public readonly root$ = this.root$$.pipe(switchAll());
  public readonly down$ = new Subject<void>();
  public readonly up$ = new Subject<void>();

  public constructor(private exprManager: ExObjectManager) {
    this.down$.subscribe(() => {
      this.getSelectedObject$()
        .pipe(first())
        .subscribe((selectedObject) => {
          this.down(selectedObject);
        });
    });
    this.up$.subscribe(() => {
      this.getSelectedObject$()
        .pipe(first())
        .subscribe((selectedObject) => {
          this.up(selectedObject);
        });
    });
  }

  @loggedMethod
  public debug() {
    const logger = Logger.logger();
    Logger.logCallstack();
    this.getSelectedObject$().subscribe((selectedObject) => {
      logger.log("selectedObject", selectedObject?.id ?? "null");
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
    Logger.logCallstack();
    const logger = Logger.logger();
    if (selectedObject === null) {
      logger.log("", "selectedObject is null");
      this.selectedObject$$.next(this.root$);
      return;
    }

    logger.log("selectedObject", selectedObject.id);

    switch (selectedObject.objectType) {
      case ExObjectType.Attribute:
        selectedObject.expr$.pipe(first()).subscribe((expr) => {
          const expr$ = this.exprManager.getObject$(expr);
          this.selectedObject$$.next(expr$);
        });
        return;
      case ExObjectType.Expr:
        this.downExpr(selectedObject);
        return;
      default:
        assertUnreachable(selectedObject);
    }
  }

  @loggedMethod
  private downExpr(selectedObject: Expr) {
    Logger.logCallstack();
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

  @loggedMethod
  private up(selectedObject: Selectable) {
    Logger.logCallstack();
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

  @loggedMethod
  private upExpr(selectedObject: Expr) {
    Logger.logCallstack();
    const logger = Logger.logger();
    const parent$ = this.exprManager.getParent$(selectedObject);
    parent$.pipe(first()).subscribe((parent) => {
      logger.log("parent", parent.id);
    });
    this.selectedObject$$.next(parent$);
  }
}
