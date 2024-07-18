import { combineLatest, map, type Observable, of, switchMap } from "rxjs";
import { type Attribute, type CallExpr, type Expr, ExprType, type NumberExpr } from "../ex-object/ExObject";
import { loggedMethod } from "../logger/LoggerDecorator";
import Logger from "../logger/Logger";
import { assertUnreachable } from "../utils/Utils";

// @ts-ignore
// const logger = Logger.file("Dehydrator.ts");

export type DehydratedExpr = DehydratedNumberExpr | DehydratedCallExpr;

export interface DehydratedAttribute {
  id: string;
  expr: DehydratedExpr;
}

export interface DehydratedNumberExpr {
  type: "NumberExpr";
  id: string;
  value: number;
}

export interface DehydratedCallExpr {
  type: "CallExpr";
  id: string;
  args: DehydratedExpr[];
}

export default class Dehydrator {
  @loggedMethod
  public dehydrateAttribute$(
    attribute: Attribute
  ): Observable<DehydratedAttribute> {
    const logger = Logger.logger();

    return attribute.expr$.pipe(
      switchMap((expr) => {
        return this.dehydrateExpr$(expr);
      }),
      map((dehydratedExpr) => {
        logger.log("map", "dehydratedExpr", dehydratedExpr);
        return {
          id: attribute.id,
          expr: dehydratedExpr,
        };
      }),
    );
  }

  @loggedMethod
  private dehydrateExpr$(expr: Expr): Observable<DehydratedExpr> {
    switch (expr.exprType) {
      case ExprType.NumberExpr:
        return this.dehydrateNumberExpr$(expr);
      case ExprType.CallExpr:
        return this.dehydrateCallExpr$(expr);
      default:
        assertUnreachable(expr);
    }
  }

  private dehydrateNumberExpr$(
    expr: NumberExpr
  ): Observable<DehydratedNumberExpr> {
    return of({
      type: "NumberExpr",
      id: expr.id,
      value: expr.value,
    });
  }

  private dehydrateCallExpr$(expr: CallExpr): Observable<DehydratedCallExpr> {
    const deArgs$ = expr.args$.pipe(
      switchMap((args) => {
        return this.dehydrateArgs$(args);
      }),
    );

    const result: Observable<DehydratedCallExpr> = deArgs$.pipe(
      map((deArgs) => {
        return {
          type: "CallExpr",
          id: expr.id,
          args: deArgs,
        };
      }),
    );

    return result;
  }

  private dehydrateArgs$(args: readonly Expr[]): Observable<DehydratedExpr[]> {
    return combineLatest(args.map((arg) => this.dehydrateExpr$(arg)));
  }
}
