import {
  BehaviorSubject,
  combineLatest,
  combineLatestAll,
  map,
  Observable,
  Observer,
  of,
  Subject,
  switchAll,
  switchMap,
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

interface AttributeMut {
  readonly attribute: ReadonlyAttribute;
  readonly expr: ExprMut;
}

type ExprMut = NumberExprMut | CallExprMut;

interface ExprBaseMut {
  readonly expr: ReadonlyExpr;
  readonly replaceWithNumberExpr: (value: number) => void;
  readonly replaceWithCallExpr: () => void;
}

interface CallExprMut {
  readonly exprBase: ExprBaseMut;
  readonly args$: Observable<Observable<ExprMut>[]>;
}

interface NumberExprMut {
  readonly exprBase: ExprBaseMut;
}

export default class ExprFactory {
  private _onNumberExprCreated$ = new Subject<ReadonlyNumberExpr>();
  private _onCallExprCreated$ = new Subject<ReadonlyCallExpr>();
  private _onAttributeCreated$ = new Subject<ReadonlyAttribute>();

  public createAttribute(): AttributeMut {
    logger.method("createAttribute");

    const attribute$ = new BehaviorSubject<Parent>(null);
    const numberExpr$ = this.createNumberExpr$(0, attribute$);
    const expr$ = new BehaviorSubject<ExprMut>(numberExpr$.value);
    numberExpr$.subscribe(expr$);
    const readonlyExpr$ = numberExpr$.pipe(map((expr) => expr.exprBase.expr));

    const attrMut: AttributeMut = {
      attribute: {
        type: "Attribute",
        expr$: readonlyExpr$,
      },
    };

    // const attribute = new Attribute(new ReadonlyAttribute(readonlyExpr$), expr$);
    attribute$.next(attrMut.attribute);
    this._onAttributeCreated$.next(attrMut.attribute);
    return attrMut;
  }

  createExprMut$(expr: ReadonlyExpr): Observable<ExprMut> {
    const expr$ = new BehaviorSubject<ExprMut | null>(null);
    const exprMut$ = this.createExprMut(expr, expr$);
    const result$ = new BehaviorSubject<ExprMut>(exprMut$);
    (expr$ as BehaviorSubject<ExprMut>).subscribe(result$);
    return result$;
  }

  createExprMut(expr: ReadonlyExpr, expr$: Observer<ExprMut>): ExprMut {
    switch (expr.type) {
      case "NumberExpr":
        return this.createNumberExprMut(expr, expr$);
      case "CallExpr":
        return this.createCallExprMut(expr, expr$);
    }
  }

  private createNumberExprMut(
    expr: ReadonlyNumberExpr,
    expr$: Observer<ExprMut>
  ): NumberExprMut {
    return {
      exprBase: this.createExprBaseMut(expr, expr$),
    };
  }

  private createCallExprMut(
    expr: ReadonlyCallExpr,
    expr$: Observer<ExprMut>
  ): CallExprMut {
    return {
      exprBase: this.createExprBaseMut(expr, expr$),
      args$: expr.args$.pipe(
        switchAll(),
        combineLatestAll(),
        map((args) => {
          return args.map((arg) => {
            return this.createExprMut$(arg);
          });
        })
      ),
    };
  }

  private createExprBaseMut(
    expr: ReadonlyExpr,
    expr$: Observer<ExprMut>
  ): ExprBaseMut {
    return {
      expr,
      replaceWithNumberExpr: (value) => {
        const readonlyExpr = this.createNumberExpr(value, expr.expr.parent$);
        expr$.next(this.createNumberExprMut(readonlyExpr, expr$));
      },
      replaceWithCallExpr: () => {
        const readonlyExpr = this.createCallExpr(expr.expr.parent$);
        expr$.next(this.createCallExprMut(readonlyExpr, expr$));
      },
    };
  }

  private createNumberExpr(
    value: number,
    parent$: Observable<Parent>
  ): ReadonlyNumberExpr {
    const value$ = new BehaviorSubject(value);
    return {
      type: "NumberExpr",
      expr: {
        id: `expr-${Math.random()}`,
        parent$,
      },
      value$,
    };
  }

  private createCallExpr(parent$: Observable<Parent>): ReadonlyCallExpr {
    return {
      type: "CallExpr",
      expr: {
        id: `expr-${Math.random()}`,
        parent$,
      },
      args$: new BehaviorSubject([]),
    };
  }

  public onNumberExprCreated$(): Observable<ReadonlyNumberExpr> {
    return this._onNumberExprCreated$;
  }

  public onCallExprCreated$(): Observable<ReadonlyCallExpr> {
    return this._onCallExprCreated$;
  }
}
