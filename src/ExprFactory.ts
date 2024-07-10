import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  Observer,
  of,
  Subject,
} from "rxjs";
import {
  Parent,
  ReadonlyCallExpr,
  ReadonlyExpr,
  ReadonlyNumberExpr,
} from "./domain/Expr";
import { ReadonlyAttribute } from "./Domain";
import Logger from "./utils/Logger";

const logger = Logger.file("ExprFactory.ts");

interface ExprReplacer {
  readonly replaceWithNumberExpr: (value: number) => void;
  readonly replaceWithCallExpr: () => void;
}

class Attribute {
  public constructor(
    public readonly readonlyAttribute: ReadonlyAttribute,
    public readonly expr$: BehaviorSubject<Expr>
  ) {}
}

class CallExpr {
  public constructor(
    public readonly readonlyExpr: ReadonlyCallExpr,
    public readonly exprReplacer: ExprReplacer
  ) {}
}

class NumberExpr {
  public constructor(
    public readonly readonlyExpr: ReadonlyNumberExpr,
    public readonly exprReplacer: ExprReplacer
  ) {}
}

type Expr = NumberExpr | CallExpr;

export default class ExprFactory {
  private _onNumberExprCreated$ = new Subject<ReadonlyNumberExpr>();
  private _onCallExprCreated$ = new Subject<ReadonlyCallExpr>();
  private _onAttributeCreated$ = new Subject<ReadonlyAttribute>();

  public createAttribute(): Attribute {
    logger.method("createAttribute");

    const attribute$ = new BehaviorSubject<Parent>(null);
    const numberExpr$ = this.createNumberExpr$(0, attribute$);
    const expr$ = new BehaviorSubject<Expr>(numberExpr$.value);
    numberExpr$.subscribe(expr$);
    const readonlyExpr$ = numberExpr$.pipe(map((expr) => expr.readonlyExpr));

    const attribute = new Attribute(new ReadonlyAttribute(readonlyExpr$), expr$);
    attribute$.next(attribute.readonlyAttribute);
    this._onAttributeCreated$.next(attribute.readonlyAttribute);
    return attribute;
  }

  private createNumberExpr$(
    value: number,
    parent$: Observable<Parent>
  ): BehaviorSubject<Expr> {
    logger.method("createNumberExpr$").log("value", value);

    const expr$ = new Subject<Expr>();
    const value$ = new BehaviorSubject<number>(value);
    const readonlyNumberExpr = new ReadonlyNumberExpr(value$, parent$);
    const numberExpr = new NumberExpr(readonlyNumberExpr, {
      replaceWithNumberExpr: (value) => {
        this.replaceWithNumberExpr(value, parent$, expr$);
      },
      replaceWithCallExpr: () => {
        this.replaceWithCallExpr(parent$, expr$);
      },
    });
    expr$.next(numberExpr);
    const result$ = new BehaviorSubject<Expr>(numberExpr);
    expr$.subscribe(result$);
    return result$;
  }

  public createNumberExpr(
    value: number,
    parent$: Observable<Parent>,
    replacer: ExprReplacer
  ): NumberExpr {
    logger.method("createNumberExpr").log("value", value);

    const readonlyNumberExpr: ReadonlyNumberExpr = new ReadonlyNumberExpr(
      of(value),
      parent$
    );
    const numberExpr = new NumberExpr(readonlyNumberExpr, replacer);
    this._onNumberExprCreated$.next(readonlyNumberExpr);
    return numberExpr;
  }

  public createCallExpr(
    parent$: Observable<Parent>,
    replacer: ExprReplacer
  ): CallExpr {
    const callExpr$ = new Subject<ReadonlyCallExpr>();

    const arg0$ = this.createNumberExpr$(0, callExpr$);
    const arg1$ = this.createNumberExpr$(0, callExpr$);
    const readonlyArgs$ = [arg0$, arg1$].map((arg$) => arg$.pipe(map((expr) => expr.readonlyExpr)));

    const args$ = new BehaviorSubject<Observable<ReadonlyExpr>[]>([]);
    args$.next(readonlyArgs$);

    const callExpr = new CallExpr(
      new ReadonlyCallExpr(args$, parent$),
      replacer
    );
    callExpr$.next(callExpr.readonlyExpr);
    return callExpr;
  }

  private replaceWithNumberExpr(
    value: number,
    parent$: Observable<Parent>,
    expr$: Observer<Expr>
  ) {
    const numberExpr = this.createNumberExpr(value, parent$, {
      replaceWithNumberExpr: (value) => {
        this.replaceWithNumberExpr(value, parent$, expr$);
      },
      replaceWithCallExpr: () => {
        this.replaceWithCallExpr(parent$, expr$);
      },
    });
    expr$.next(numberExpr);
    return numberExpr;
  }

  private replaceWithCallExpr(
    parent$: Observable<Parent>,
    expr$: Observer<Expr>
  ) {
    const callExpr = this.createCallExpr(parent$, {
      replaceWithNumberExpr: (value) => {
        this.replaceWithNumberExpr(value, parent$, expr$);
      },
      replaceWithCallExpr: () => {
        this.replaceWithCallExpr(parent$, expr$);
      },
    });
    expr$.next(callExpr);
    return callExpr;
  }

  public onNumberExprCreated$(): Observable<ReadonlyNumberExpr> {
    return this._onNumberExprCreated$;
  }

  public onCallExprCreated$(): Observable<ReadonlyCallExpr> {
    return this._onCallExprCreated$;
  }
}
