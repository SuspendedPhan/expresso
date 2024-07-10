import {
  BehaviorSubject,
  Observable,
  combineLatest,
  map,
  of,
  share,
  switchAll,
  switchMap,
} from "rxjs";
// import { ReadonlyAttribute, ReadonlyCallExpr, ReadonlyExpr, ReadonlyNumberExpr } from "../Domain";
import Logger from "./Logger";
import { type ReadonlyAttribute } from "../Domain";
import type {
  ReadonlyCallExpr,
  ReadonlyExpr,
  ReadonlyNumberExpr,
} from "../domain/Expr";
import { Attribute, Expr } from "../ExprFactory";

export type Selectable = Attribute | Expr | null;

const logger = Logger.file("Selection.ts");
logger.allow();

export default class Selection {
  private selectedObject$ = new BehaviorSubject<Observable<Selectable>>(
    of(null)
  );

  public constructor(private root: Observable<Attribute>) {}

  public select(object$: Observable<Selectable>) {
    if (object$ === null) {
      this.selectedObject$.next(of(null));
      return;
    }
    this.selectedObject$.next(object$);
  }

  public down() {
    logger.log("down");
    const getNextObject$ = this.getChild$.bind(this);
    this.handleNavigation(getNextObject$);
  }

  public up() {
    logger.log("up");
    const getNextObject$ = this.getParent$.bind(this);
    this.handleNavigation(getNextObject$);
  }

  private handleNavigation(
    getNextObject$: (currentObject: Selectable) => Observable<Selectable>
  ) {
    const object$ = this.selectedObject$.value;
    logger.log("selectedObject", object$);

    const child$ = object$.pipe(
      switchMap((object) => {
        const child$ = getNextObject$(object);
        return child$;
      }),
      switchMap((child) => {
        if (child === null) {
          return object$;
        }
        return of(child);
      })
    );
    this.select(child$);
  }

  private getChild$(object: Selectable): Observable<Selectable> {
    if (object === null) {
      return this.root;
    } else if (object.type === "Attribute") {
      return object.expr$;
    } else {
      return this.getChildForExpr$(object);
    }
  }

  private getParent$(object: Selectable): Observable<Selectable> {
    return this.root.pipe(
      switchMap((root) => {
        if (object === null) {
          return of(null);
        } else if (object === root) {
          return of(null);
        } else if (object.type === "Attribute") {
          throw new Error("Not implemented");
        } else if (object) {
          return object.parent$;
        } else {
          logger.log("object", object);
          throw new Error("Unknown object type");
        }
      })
    );
  }

  private getChildForExpr$(expr: Expr): Observable<Selectable> {
    if (expr.type === "NumberExpr") {
      return of(null);
    } else if (expr.type === "CallExpr") {
      if (expr.args[0] === undefined) {
        throw new Error("No args");
      }
      return expr.args[0];
    } else {
      throw new Error("Unknown expr type");
    }
  }

  public getSelectedObject$(): Observable<Selectable> {
    return this.selectedObject$.pipe(switchAll(), share());
  }
}
