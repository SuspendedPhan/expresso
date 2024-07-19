import {
  BehaviorSubject,
  first,
  map,
  type Observable,
  of,
  ReplaySubject,
  Subject,
  switchMap
} from "rxjs";
import { type ExObject, ExObjectType, type Expr, ExprType } from "src/ex-object/ExObject";
import Logger from "src/logger/Logger";
import { loggedMethod } from "src/logger/LoggerDecorator";
import { assertUnreachable } from "src/utils/Utils";

enum SelectedObjectType {
  Root,
}

export type Selectable = ExObject | null;
type SelectedObject = Selectable | SelectedObjectType;

export default class Selection {
  private readonly selectedObject$ = new BehaviorSubject<SelectedObject>(null);
  public readonly root$ = new ReplaySubject<ExObject>(1);

  public readonly down$ = new Subject<void>();
  public readonly up$ = new Subject<void>();

  public constructor() {
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
    this.getSelectedObject$().subscribe((selectedObject) => {
      logger.log("selectedObject", selectedObject?.id ?? "null");
    });
  }

  public getSelectedObject$(): Observable<Selectable> {
    return this.selectedObject$.pipe(
      switchMap((selectedObject) => {
        if (selectedObject === SelectedObjectType.Root) {
          return this.root$;
        }
        return of(selectedObject);
      })
    );
  }

  public isSelected$(object: Selectable): Observable<boolean> {
    return this.getSelectedObject$().pipe(
      map((selectedObject) => selectedObject === object)
    );
  }

  public select(object: Selectable) {
    this.selectedObject$.next(object);
  }

  @loggedMethod
  private down(selectedObject: Selectable) {
    const logger = Logger.logger();
    if (selectedObject === null) {
      logger.log("", "selectedObject is null");
      this.selectedObject$.next(SelectedObjectType.Root);
      return;
    }

    logger.log("selectedObject", selectedObject.id);

    switch (selectedObject.objectType) {
      case ExObjectType.Attribute:
        selectedObject.expr$.pipe(first()).subscribe((expr) => {
          this.selectedObject$.next(expr);
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
          this.selectedObject$.next(arg);
        });
        return;
      default:
        assertUnreachable(selectedObject);
    }
  }

  @loggedMethod
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

  @loggedMethod
  private upExpr(selectedObject: Expr) {
    const parent$ = selectedObject.parent$;
    parent$.pipe(first()).subscribe((parent) => {
      this.selectedObject$.next(parent);
    });
  }
}
