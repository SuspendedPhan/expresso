import {
  BehaviorSubject,
  Observable,
  map,
  of,
  share,
  switchAll,
  switchMap,
} from "rxjs";
// import { Attribute, CallExpr, Expr, NumberExpr } from "../Domain";
import Logger from "./Logger";
import { Attribute } from "../Domain";
import { ReadonlyExpr } from "../domain/Expr";

export type Selectable = Attribute | ReadonlyExpr;

const logger = Logger.file("Selection.ts");
logger.allow();

export default class Selection {
  private selectedObject$ = new BehaviorSubject<Observable<Selectable | null>>(
    of(null)
  );

  public constructor(private root: Attribute) {}

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
    } else if (object instanceof Attribute) {
      return object.getExpr$();
    } else if (object instanceof Expr) {
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
    } else if (object instanceof Attribute) {
      throw new Error("Not implemented");
    } else if (object instanceof Expr) {
      return object.getParent$();
    } else {
      logger.log("object", object);
      throw new Error("Unknown object type");
    }
  }

  private getChildForExpr$(expr: Expr): Observable<Expr | null> {
    if (expr instanceof NumberExpr) {
      return of(null);
    } else if (expr instanceof CallExpr) {
      return expr.getArgs$().pipe(map((args) => {
        if (args.length === 0) {
          throw new Error("No args");
        }
        return args[0]!;
      }));
    } else {
      throw new Error("Unknown expr type");
    }
  }

  public getSelectedObject$(): Observable<Selectable | null> {
    return this.selectedObject$.pipe(switchAll(), share());
  }
}
