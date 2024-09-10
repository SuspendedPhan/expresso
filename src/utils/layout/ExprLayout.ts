
import { Effect } from "effect";
import { ExprCtx } from "src/ctx/ExprCtx";
import { ExprFactory, type Expr } from "src/ex-object/Expr";
import { isType } from "variant";
import { ElementLayout } from "./ElementLayout";

export function createExprLayout(rootExpr: Expr) {
  return Effect.gen(function* () {
    const childrenByExpr = new Map<Expr, readonly Expr[]>();

    function getChildren(expr: Expr) {
      return childrenByExpr.get(expr) ?? [];
    }

    (yield* ExprCtx.exprs).events$.subscribe((event) => {
      if (event.type !== "ItemAdded") {
        return;
      }

      const expr = event.item;
      if (isType(expr, ExprFactory.Call)) {
        expr.args$.subscribe((args) => {
          childrenByExpr.set(expr, args);
        });
      }
    });
    
    return new ElementLayout(
      () => rootExpr,
      (expr) => getChildren(expr),
      (expr) => expr.id,
      16,
      16
    );
  });
}

