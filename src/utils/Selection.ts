import { BehaviorSubject, Observable, map, of, take } from "rxjs";
import { Attribute, CallExpr, Expr, NumberExpr } from "../Domain";
import Logger from "./Logger";

export type Selectable = Attribute | Expr;

const logger = Logger.topic("Selection.ts");

export default class Selection {
  private selectedObject$ = new BehaviorSubject<Selectable | null>(null);

  public constructor(private root: Attribute) {}

  public select(object: any) {
    this.selectedObject$.next(object);
  }

  public down() {
    logger.log("down");

    const selectedObject = this.selectedObject$.value;
    logger.log("selectedObject", selectedObject);

    if (selectedObject === null) {
      this.selectedObject$.next(this.root);
      return;
    }

    this.getChild$(selectedObject)
      .pipe(take(1))
      .subscribe((child) => {
        logger.log("child", child);
        if (child !== null) {
          this.selectedObject$.next(child);
        }
      });
  }

  private getChild$(object: Selectable): Observable<Selectable | null> {
    if (object instanceof Attribute) {
      return object.getExpr$();
    } else if (object instanceof Expr) {
      return this.getChildExpr$(object);
    } else {
      throw new Error("Unknown object type");
    }
  }

  private getChildExpr$(expr: Expr): Observable<Expr | null> {
    if (expr instanceof NumberExpr) {
      return of(null);
    } else if (expr instanceof CallExpr) {
      return expr.getArgs$().pipe(map((args) => args[0]));
    } else {
      throw new Error("Unknown expr type");
    }
  }

  public getSelectedObject$(): Observable<Selectable | null> {
    return this.selectedObject$;
  }
}
