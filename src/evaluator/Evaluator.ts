import { combineLatest, Observable, of, switchMap } from "rxjs";
import CircleComponent from "../domain/Component";
import { ReadonlyAttribute, Expr } from "../Domain";

export interface EvaluatedCircleClone {
  x: number;
  y: number;
  radius: number;
}

export default class Evaluator {
  public constructor(private circle$: Observable<CircleComponent>) {}
  public evaluate$(): Observable<EvaluatedCircleClone[]> {
    return this.circle$.pipe(
      switchMap((circleComponent) => {
        return combineLatest([
          this.evalAttribute$(circleComponent.getX$()),
          this.evalAttribute$(circleComponent.getY$()),
          this.evalAttribute$(circleComponent.getRadius$()),
        ]);
      }),
      switchMap(([x, y, radius]) => {
        return of([{ x, y, radius }]);
      })
    );
  }

  private evalAttribute$(
    attribute$: Observable<ReadonlyAttribute>
  ): Observable<number> {
    return attribute$.pipe(
      switchMap((attribute) => {
        return attribute.getExpr$();
      })
    );
  }

  private evalExpr$(expr$: Observable<Expr>): Observable<number> {
  }
}
