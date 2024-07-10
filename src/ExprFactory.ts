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
import { ReadonlyAttribute } from "./Domain";

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
    const attribute = new ReadonlyAttribute(expr$);
    this._onAttributeCreated$.next(attribute);
    
    return {
      ...attribute,
      replaceWithNumberExpr: (value: number) => {
        const numberExpr = this.createNumberExpr(value);
        expr$.next(numberExpr);
      },
      replaceWithCallExpr: () => {
        const callExpr = this.createCallExpr();
        expr$.next(callExpr);
      },
    };
  }

  public createNumberExpr(value: number): ReadonlyNumberExpr {
    const numberExpr: ReadonlyNumberExpr = new ReadonlyNumberExpr(of(value));
    this._onNumberExprCreated$.next(numberExpr);
    return numberExpr;
  }

  public createCallExpr(): CallExpr {
    const args$ = new BehaviorSubject<BehaviorSubject<ReadonlyExpr>[]>([]);
    const callExpr: ReadonlyCallExpr = new ReadonlyCallExpr(args$);

    const arg0 = this.createNumberExpr(19);
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
