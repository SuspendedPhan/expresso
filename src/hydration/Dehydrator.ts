import {
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import { Attribute, CallExpr, Expr, NumberExpr } from "../ExprFactory";
import { loggedMethod } from "../logger/LoggerDecorator";
import Logger from "../logger/Logger";

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
    return this.dehydrateExpr$(attribute.expr$).pipe(
      map((dehydratedExpr) => ({
        id: attribute.id,
        expr: dehydratedExpr,
      }))
    );
  }

  @loggedMethod
  private dehydrateExpr$(expr$: Observable<Expr>): Observable<DehydratedExpr> {
    Logger.logCallstack();
    return expr$.pipe(
      switchMap((expr) => {
        switch (expr.type) {
          case "NumberExpr":
            return this.dehydrateNumberExpr$(expr);
          case "CallExpr":
            return this.dehydrateCallExpr$(expr);
          default:
            throw new Error(`Unknown expr type: ${expr}`);
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
