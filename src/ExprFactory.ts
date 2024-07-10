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

type ExprMut = NumberExprMut | CallExprMut;

export interface ExprBaseMut {
  readonly expr: ReadonlyExpr;
  readonly replaceWithNumberExpr: (value: number) => void;
  readonly replaceWithCallExpr: () => void;
}

export interface CallExprMut {
  readonly exprBaseMut: ExprBaseMut;
  readonly argsMut$$: Observable<Observable<ExprMut>[]>;
}

export interface NumberExprMut {
  readonly exprBaseMut: ExprBaseMut;
}

export default class ExprFactory {
  private _onNumberExprCreated$ = new Subject<ReadonlyNumberExpr>();
  private _onCallExprCreated$ = new Subject<ReadonlyCallExpr>();
  private _onAttributeCreated$ = new Subject<ReadonlyAttribute>();

  public createAttribute(): AttributeMut {
    logger.method("createAttribute");

    const attribute$ = new BehaviorSubject<Parent>(null);
    const numberExpr = this.createNumberExpr(0, attribute$);
    const exprMut$ = this.createExprMut$(numberExpr);
    const expr$ = exprMut$.pipe(map((exprMut) => exprMut.exprBaseMut.expr));

    const attrMut: AttributeMut = {
      attribute: {
        type: "Attribute",
        id: `attribute-${Math.random()}`,
        expr$,
      },
      exprMut$: exprMut$,
    };

    // const attribute = new Attribute(new ReadonlyAttribute(readonlyExpr$), expr$);
    attribute$.next(attrMut.attribute);
    this._onAttributeCreated$.next(attrMut.attribute);
    return attrMut;
  }

  private createExprMut$(expr: ReadonlyExpr): Observable<ExprMut> {
    const exprMutSubject$ = new BehaviorSubject<ExprMut | null>(null);
    const exprMut$ = this.createExprMut(expr, exprMutSubject$);
    exprMutSubject$.next(exprMut$);
    return exprMutSubject$ as Observable<ExprMut>;
  }

  private createExprMut(expr: ReadonlyExpr, expr$: Observer<ExprMut>): ExprMut {
    switch (expr.type) {
      case "NumberExpr":
        return this.createNumberExprMut(expr, expr$);
      case "CallExpr":
        return this.createCallExprMut(expr, expr$);
      default:
        throw new Error(`Unknown expr type: ${expr}`);
    }
  }

  private createNumberExprMut(
    expr: ReadonlyNumberExpr,
    expr$: Observer<ExprMut>
  ): NumberExprMut {
    return {
      exprBaseMut: this.createExprBaseMut(expr, expr$),
    };
  }

  private createCallExprMut(
    expr: ReadonlyCallExpr,
    expr$: Observer<ExprMut>
  ): CallExprMut {
    return {
      exprBaseMut: this.createExprBaseMut(expr, expr$),
      argsMut$$: expr.args$.pipe(
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
