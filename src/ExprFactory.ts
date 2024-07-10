import {
  BehaviorSubject,
  combineLatestAll,
  map,
  Observable,
  Observer,
  Subject,
  switchAll,
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

export interface AttributeMut {
  readonly attribute: ReadonlyAttribute;
  readonly exprMut$: Observable<ExprMut>;
}

export type ExprMut = NumberExprMut | CallExprMut;

export interface ExprBaseMut {
  readonly expr$: Observable<ReadonlyExpr>;
  readonly replaceWithNumberExpr$: Observer<number>;
  readonly replaceWithCallExpr$: Observer<void>;
}

export interface CallExprMut {
  readonly type: "CallExprMut";
  readonly exprBaseMut: ExprBaseMut;
  readonly argsMut$$: Observable<Observable<ExprMut>[]>;
}

export interface NumberExprMut {
  readonly type: "NumberExprMut";
  readonly exprBaseMut: ExprBaseMut;
}

export default class ExprFactory {
  private _onNumberExprCreated$ = new Subject<ReadonlyNumberExpr>();
  private _onCallExprCreated$ = new Subject<ReadonlyCallExpr>();
  private _onAttributeCreated$ = new Subject<ReadonlyAttribute>();

  public createAttribute(): AttributeMut {
    const replaceWithCallExpr$ = new Subject<void>();
    const replaceWithNumberExpr$ = new Subject<number>();

    const expr: ReadonlyExpr = {
      type: "NumberExpr",
      exprBase: {
        id: `expr-${Math.random()}`,
        parent$: new BehaviorSubject<Parent>(null),
      },
      value$: new BehaviorSubject<number>(0),
    };

    const expr$ = new BehaviorSubject<ReadonlyExpr>(expr);

    const attribute: ReadonlyAttribute = {
      type: "Attribute",
      id: `attr-${Math.random()}`,
      expr$,
    };

    const exprMut: NumberExprMut = {
      type: "NumberExprMut",
      exprBaseMut: {
        expr$,
        replaceWithNumberExpr$,
        replaceWithCallExpr$,
      },
    };

    const exprMut$ = new BehaviorSubject<ExprMut>(exprMut);

    const attributeMut: AttributeMut = {
      attribute,
      exprMut$,
    };

    replaceWithCallExpr$.subscribe(() => {
      const callExpr: ReadonlyCallExpr = {
        type: "CallExpr",
        exprBase: {
          id: `expr-${Math.random()}`,
          parent$: new BehaviorSubject<Parent>(null),
        },
        args$$: new BehaviorSubject<Observable<ReadonlyExpr>[]>([]),
      };

      const callExprMut: CallExprMut = {
        type: "CallExprMut",
        exprBaseMut: {
          expr$: new BehaviorSubject<ReadonlyExpr>(callExpr),
          replaceWithNumberExpr$,
          replaceWithCallExpr$,
        },
        argsMut$$: new BehaviorSubject<Observable<ExprMut>[]>([]),
      };

      expr$.next(callExpr);
      exprMut$.next(callExprMut);
      this._onCallExprCreated$.next(callExpr);
    });

    this._onAttributeCreated$.next(attribute);
    return attributeMut;
  }

  public onNumberExprCreated$(): Observable<ReadonlyNumberExpr> {
    return this._onNumberExprCreated$;
  }

  public onCallExprCreated$(): Observable<ReadonlyCallExpr> {
    return this._onCallExprCreated$;
  }
}
