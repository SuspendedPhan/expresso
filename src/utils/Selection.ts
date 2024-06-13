import { BehaviorSubject, Observable, map, of, take } from "rxjs";
import { Attribute, CallExpr, Expr, NumberExpr } from "../Domain";

type Selectable = Attribute | Expr;

export default class Selection {
  private selectedObject$ = new BehaviorSubject<Selectable | null>(null);

  public constructor(private root: Attribute) {}

  public select(object: any) {
    this.selectedObject$.next(object);
  }

  public down() {
    const selectedObject = this.selectedObject$.value;
    if (selectedObject === null) {
      this.selectedObject$.next(this.root);
      return;
    }

    this.getChild$(selectedObject)
      .pipe(take(1))
      .subscribe((child) => {
        this.selectedObject$.next(child);
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
