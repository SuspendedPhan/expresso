import {
  BehaviorSubject,
  Observable,
  of,
  Subject,
} from "rxjs";
import {
  ReadonlyCallExpr,
  ReadonlyExpr,
  ReadonlyNumberExpr,
} from "./domain/Expr";

interface CallExpr extends ReadonlyCallExpr {
  replaceArgWithNumberExpr(index: number, value: number): void;
  replaceArgWithCallExpr(index: number): void;
}

export default class ExprFactory {
  private _onNumberExprCreated$ = new Subject<ReadonlyNumberExpr>();
  private _onCallExprCreated$ = new Subject<ReadonlyCallExpr>();

  public createNumberExpr(value: number): ReadonlyNumberExpr {
    const numberExpr: ReadonlyNumberExpr = {
      id: `number-${Math.random()}`,
      value$: of(value),
    };
    this._onNumberExprCreated$.next(numberExpr);
    return numberExpr;
  }

  public createCallExpr(): CallExpr {
    const args = new BehaviorSubject<BehaviorSubject<ReadonlyExpr>[]>([]);
    const callExpr = {
      id: `call-${Math.random()}`,
      args,
    };

    const arg0 = this.createNumberExpr(1);
    const arg1 = this.createNumberExpr(2);
    callExpr.args.next([
      new BehaviorSubject<ReadonlyExpr>(arg0),
      new BehaviorSubject<ReadonlyExpr>(arg1),
    ]);

    this._onCallExprCreated$.next(callExpr);

    return {
      ...callExpr,
      replaceArgWithNumberExpr: (index: number, value: number) => {
        const arg = args.value[index];
        const numberExpr = this.createNumberExpr(value);
        if (arg === undefined) {
          throw new Error("arg is undefined");
        }
        arg.next(numberExpr);
      },
      replaceArgWithCallExpr: (index: number) => {
        const arg = args.value[index];
        if (arg === undefined) {
          throw new Error("arg is undefined");
        }
        const callExpr = this.createCallExpr();
        arg.next(callExpr);
      },
    };
  }

  public onNumberExprCreated$(): Observable<ReadonlyNumberExpr> {
    return this._onNumberExprCreated$;
  }

  public onCallExprCreated$(): Observable<ReadonlyCallExpr> {
    return this._onCallExprCreated$;
  }
}
