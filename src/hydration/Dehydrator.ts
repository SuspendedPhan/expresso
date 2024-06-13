import { Observable, combineLatest, combineLatestAll, map, mergeAll, mergeMap, of, switchMap } from "rxjs";
import {
  Attribute,
  Expr,
  NumberExpr,
  PrimitiveFunctionCallExpr,
} from "../Domain";
import Logger from "../utils/Logger";

const logger = Logger.topic("Dehydrator.ts");

export interface DehydratedAttribute {
  id: string;
  expr: DehydratedExpr;
}

export interface DehydratedExpr {
  id: string;
  exprType: string;
}

export interface DehydratedNumberExpr extends DehydratedExpr {
  value: number;
}

export interface DehydratedPrimitiveFunctionCallExpr extends DehydratedExpr {
  args: Array<DehydratedExpr>;
}

export default class Dehydrator {
  public static dehydrateAttribute$(
    attribute: Attribute
  ): Observable<DehydratedAttribute> {
    return attribute.getExpr$().pipe(
      mergeMap((expr) => {
        return this.dehydrateExpr$(expr);
      }),
      map((dehydratedExpr) => {
        return {
          id: attribute.getId(),
          expr: dehydratedExpr,
        };
      })
    );
  }

  private static dehydrateExpr$(expr: Expr): Observable<DehydratedExpr> {
    if (expr instanceof NumberExpr) {
      return this.dehydrateNumberExpr$(expr);
    } else if (expr instanceof PrimitiveFunctionCallExpr) {
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

  private static dehydrateArgs$(args: Array<Expr>): Observable<Array<DehydratedExpr>> {
    const dehydrated$Args = args.map((arg) => {
      return this.dehydrateExpr$(arg);
    });
    return combineLatest(dehydrated$Args);
  }
}
