import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import {
  Parent,
  ReadonlyCallExpr,
  ReadonlyExpr,
  ReadonlyNumberExpr,
} from "./domain/Expr";
import { ReadonlyAttribute } from "./Domain";

class Attribute extends ReadonlyAttribute {
  public constructor(
    public readonly replaceWithNumberExpr: (value: number) => void,
    public readonly replaceWithCallExpr: () => void,
    expr$: BehaviorSubject<ReadonlyExpr>
  ) {
    super(expr$);
  }
}

class CallExpr extends ReadonlyCallExpr {
  public constructor(
    public readonly replaceArgWithNumberExpr: (
      index: number,
      value: number
    ) => void,
    public readonly replaceArgWithCallExpr: (index: number) => void,
    args$: BehaviorSubject<BehaviorSubject<ReadonlyExpr>[]>,
    parent$: Observable<Parent>,
  ) {
    super(args$, parent$);
  }
}

export default class ExprFactory {
  private _onNumberExprCreated$ = new Subject<ReadonlyNumberExpr>();
  private _onCallExprCreated$ = new Subject<ReadonlyCallExpr>();
  private _onAttributeCreated$ = new Subject<ReadonlyAttribute>();

  public createAttribute(): Attribute {
    const attribute$ = new BehaviorSubject<Parent>(null);
    const expr = this.createNumberExpr(0, attribute$);
    const expr$ = new BehaviorSubject<ReadonlyExpr>(expr);

    const replaceWithNumberExpr = (value: number) => {
      const numberExpr = this.createNumberExpr(value, attribute$);
      expr$.next(numberExpr);
    };

    const replaceWithCallExpr = () => {
      const callExpr = this.createCallExpr(attribute$);
      expr$.next(callExpr);
    }

    const attribute = new Attribute(replaceWithNumberExpr, replaceWithCallExpr, expr$);
    attribute$.next(attribute);
    this._onAttributeCreated$.next(attribute);
    return attribute;
  }

  public createNumberExpr(
    value: number,
    parent$: Observable<Parent>
  ): ReadonlyNumberExpr {
    const numberExpr: ReadonlyNumberExpr = new ReadonlyNumberExpr(
      of(value),
      parent$
    );
    this._onNumberExprCreated$.next(numberExpr);
    return numberExpr;
  }

  public createCallExpr(parent$: Observable<Parent>): CallExpr {
    const args$ = new BehaviorSubject<BehaviorSubject<ReadonlyExpr>[]>([]);
    const callExpr$ = new BehaviorSubject<Parent>(null);

    const arg0 = this.createNumberExpr(19, callExpr$);
    const arg1 = this.createNumberExpr(2, callExpr$);
    args$.next([
      new BehaviorSubject<ReadonlyExpr>(arg0),
      new BehaviorSubject<ReadonlyExpr>(arg1),
    ]);

    const replaceArgWithNumberExpr = (index: number, value: number) => {
      const arg = args$.value[index];
      const numberExpr = this.createNumberExpr(value, callExpr$);
      if (arg === undefined) {
        throw new Error("arg is undefined");
      }
      arg.next(numberExpr);
    };

    const replaceArgWithCallExpr = (index: number) => {
      const arg = args$.value[index];
      if (arg === undefined) {
        throw new Error("arg is undefined");
      }
      const callExpr = this.createCallExpr(callExpr$);
      arg.next(callExpr);
    };

    const callExpr = new CallExpr(replaceArgWithNumberExpr, replaceArgWithCallExpr, args$, parent$);
    callExpr$.next(callExpr);
    this._onCallExprCreated$.next(callExpr);
    return callExpr;
  }

  public onNumberExprCreated$(): Observable<ReadonlyNumberExpr> {
    return this._onNumberExprCreated$;
  }

  public onCallExprCreated$(): Observable<ReadonlyCallExpr> {
    return this._onCallExprCreated$;
  }
}
