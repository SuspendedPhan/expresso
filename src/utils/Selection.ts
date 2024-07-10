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
import type { ReadonlyCallExpr, ReadonlyExpr, ReadonlyNumberExpr } from "../domain/Expr";

export type Selectable = ReadonlyAttribute | ReadonlyExpr;

const logger = Logger.file("Selection.ts");
logger.allow();

export default class Selection {
  private selectedObject$ = new BehaviorSubject<Observable<Selectable | null>>(
    of(null)
  );

  public constructor(private root: ReadonlyAttribute) {}

  public select(object$: Observable<Selectable | null>) {
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
    getNextObject$: (
      currentObject: Selectable | null
    ) => Observable<Selectable | null>
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

  private getChild$(object: Selectable | null): Observable<Selectable | null> {
    if (object === null) {
      return of(this.root);
    } else if (object instanceof ReadonlyAttribute) {
      return object.expr$;
    } else if (object instanceof ReadonlyExpr) {
      return this.getChildForExpr$(object);
    } else {
      throw new Error("Unknown object type");
    }
  }

  private getParent$(object: Selectable | null): Observable<Selectable | null> {
    if (object === null) {
      return of(null);
    } else if (object === this.root) {
      return of(null);
    } else if (object instanceof ReadonlyAttribute) {
      throw new Error("Not implemented");
    } else if (object instanceof ReadonlyExpr) {
      return object.parent$;
    } else {
      logger.log("object", object);
      throw new Error("Unknown object type");
    }
  }

  private getChildForExpr$(expr: ReadonlyExpr): Observable<ReadonlyExpr | null> {
    if (expr instanceof ReadonlyNumberExpr) {
      return of(null);
    } else if (expr instanceof ReadonlyCallExpr) {
      return expr.args$.pipe(switchMap((args) => {
        if (args[0] === undefined) {
          throw new Error("args[0] is undefined");
        }
        return args[0];
      }));
    } else {
      throw new Error("Unknown expr type");
    }
  }

  public getSelectedObject$(): Observable<Selectable | null> {
    return this.selectedObject$.pipe(switchAll(), share());
  }
}
