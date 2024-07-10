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
import { Attribute as ReadonlyAttribute } from "./Domain";

interface Attribute extends ReadonlyAttribute {
  replaceWithNumberExpr(value: number): void;
  replaceWithCallExpr(): void;
}

interface CallExpr extends ReadonlyCallExpr {
  replaceArgWithNumberExpr(index: number, value: number): void;
  replaceArgWithCallExpr(index: number): void;
}

export default class ExprFactory {
  private _onNumberExprCreated$ = new Subject<ReadonlyNumberExpr>();
  private _onCallExprCreated$ = new Subject<ReadonlyCallExpr>();
  private _onAttributeCreated$ = new Subject<ReadonlyAttribute>();

  public createAttribute(): Attribute {
    const expr = this.createNumberExpr(0);
    const expr$ = new BehaviorSubject<ReadonlyExpr>(expr);
    const attribute = {
      id: `attribute-${Math.random()}`,
      expr$,
      replaceWithNumberExpr: (value: number) => {
        const numberExpr = this.createNumberExpr(value);
        expr$.next(numberExpr);
      },
      replaceWithCallExpr: () => {
        const callExpr = this.createCallExpr();
        expr$.next(callExpr);
      },
    };
    this._onAttributeCreated$.next(attribute);
    return attribute;
  }

  public createNumberExpr(value: number): ReadonlyNumberExpr {
    const numberExpr: ReadonlyNumberExpr = {
      type: "NumberExpr",
      id: `number-${Math.random()}`,
      value$: of(value),
    };
    this._onNumberExprCreated$.next(numberExpr);
    return numberExpr;
  }

  public createCallExpr(): CallExpr {
    const args$ = new BehaviorSubject<BehaviorSubject<ReadonlyExpr>[]>([]);
    const callExpr: ReadonlyCallExpr = {
      type: "CallExpr",
      id: `call-${Math.random()}`,
      args$,
    };

    const arg0 = this.createNumberExpr(1);
    const arg1 = this.createNumberExpr(2);
    args$.next([
      new BehaviorSubject<ReadonlyExpr>(arg0),
      new BehaviorSubject<ReadonlyExpr>(arg1),
    ]);

    this._onCallExprCreated$.next(callExpr);

    return {
      ...callExpr,
      replaceArgWithNumberExpr: (index: number, value: number) => {
        const arg = args$.value[index];
        const numberExpr = this.createNumberExpr(value);
        if (arg === undefined) {
          throw new Error("arg is undefined");
        }
        arg.next(numberExpr);
      },
      replaceArgWithCallExpr: (index: number) => {
        const arg = args$.value[index];
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
