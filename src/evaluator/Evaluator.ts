import { combineLatest, Observable, of } from "rxjs";
import CircleComponent from "../domain/Component";
import { Attribute } from "../Domain";

export interface EvaluatedCircleClone {
  x: number;
  y: number;
  radius: number;
}

export default class Evaluator {
  public constructor(private circle$: Observable<CircleComponent>) {}
  public evaluate$(): Observable<EvaluatedCircleClone[]> {
    return new Observable<EvaluatedCircleClone[]>((subscriber) => {
      this.circle$.subscribe((circleComponent) => {
        combineLatest([
          this.evalAttribute$(circleComponent.getX$()),
          this.evalAttribute$(circleComponent.getY$()),
          this.evalAttribute$(circleComponent.getRadius$()),
        ]).subscribe(([x, y, radius]) => {
          subscriber.next([{ x, y, radius }]);
        });
      });
    });
  }

  private evalAttribute$(attribute$: Observable<Attribute>): Observable<number> {
    // TODO: Implement this
    return of(0);
  }
}
