import { combineLatest, map, Observable, of, switchMap } from "rxjs";
import { Attribute, CallExpr, Expr, ExprType, NumberExpr } from "../ExObject";
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
    return this.dehydrateExpr$(attribute.expr$).pipe(
      map((dehydratedExpr) => {
        logger.log("map", "dehydratedExpr", dehydratedExpr);
        return {
          id: attribute.id,
          expr: dehydratedExpr,
        };
      })
    );
  }

  @loggedMethod
  private dehydrateExpr$(expr$: Observable<Expr>): Observable<DehydratedExpr> {
    const logger = Logger.logger();
    return expr$.pipe(
      switchMap((expr) => {
        logger.log("switchMap", expr.objectType);

        switch (expr.exprType) {
          case ExprType.NumberExpr:
            logger.log("switchMap.NumberExpr", expr.value);
            return this.dehydrateNumberExpr$(expr);
          case ExprType.CallExpr:
            return this.dehydrateCallExpr$(expr);
          default:
            assertUnreachable(expr);
        }
      })
    );
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
    const deArgs = expr.args.map((arg$) => {
      return this.dehydrateExpr$(arg$);
    });

    const result: Observable<DehydratedCallExpr> = combineLatest(deArgs).pipe(
      map((dehydratedArgs) => {
        return {
          type: "CallExpr",
          id: expr.id,
          args: dehydratedArgs,
        };
      })
    );

    return result;
  }
}
