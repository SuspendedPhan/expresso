import { Observable, combineLatest, map, mergeMap, of, switchMap } from "rxjs";
import {
  ReadonlyAttribute,
  // Expr,
  // NumberExpr,
  // PrimitiveFunctionCallExpr,
} from "../Domain";
import Logger from "../utils/Logger";
import type { ReadonlyExpr, ReadonlyNumberExpr } from "../domain/Expr";

// @ts-ignore
const logger = Logger.file("Dehydrator.ts");

export type DehydratedExpr = DehydratedNumberExpr | DehydratedPrimitiveFunctionCallExpr;

export interface DehydratedAttribute {
  id: string;
  expr: DehydratedExpr;
}

export interface DehydratedExprBase {
  id: string;
  exprType: string;
}

export interface DehydratedNumberExpr {
  expr: DehydratedExprBase;
  value: number;
}

export interface DehydratedPrimitiveFunctionCallExpr {
  expr: DehydratedExprBase;
  args: Array<DehydratedExprBase>;
}

export default class Dehydrator {
  public static dehydrateAttribute$(
    attribute: ReadonlyAttribute
  ): Observable<DehydratedAttribute> {
    return attribute.expr$.pipe(
      switchMap((expr) => {
        return this.dehydrateExpr$(expr);
      }),
      map((dehydratedExpr) => {
        return {
          id: attribute.id,
          expr: dehydratedExpr,
        };
      })
    );
  }

  private static dehydrateExpr$(expr: ReadonlyExpr): Observable<DehydratedExpr> {
    if (expr instanceof ReadonlyNumberExpr) {
      return this.dehydrateNumberExpr$(expr);
    } else if (expr instanceof ReadonlyPrimitiveFunctionCallExpr) {
      return this.dehydratePrimitiveFunctionCallExpr$(expr);
    } else {
      throw new Error("Unknown expr type");
    }
  }

  private static dehydrateNumberExpr$(
    expr: NumberExpr
  ): Observable<DehydratedNumberExpr> {
    return of({
      id: expr.getId(),
      exprType: `NumberExpr`,
      value: expr.getValue(),
    });
  }

  private static dehydratePrimitiveFunctionCallExpr$(
    expr: PrimitiveFunctionCallExpr
  ): Observable<DehydratedPrimitiveFunctionCallExpr> {
    const dehydratedArgs = expr.getArgs$().pipe(
      switchMap((args) => {
        return this.dehydrateArgs$(args);
      })
    );

    return dehydratedArgs.pipe(
      map((dehydratedArgs) => {
        return {
          id: expr.getId(),
          exprType: `PrimitiveFunctionCallExpr`,
          args: dehydratedArgs,
        };
      })
    );
  }

  private static dehydrateArgs$(args: Array<Expr>): Observable<Array<DehydratedExprBase>> {
    const dehydrated$Args = args.map((arg) => {
      return this.dehydrateExpr$(arg);
    });
    return combineLatest(dehydrated$Args);
  }
}
