import { Effect } from "effect";
import { Expr, ExprFactory } from "src/ex-object/Expr";
import { isType } from "variant";
import { ElementLayout } from "./ElementLayout";

export function createExprLayout(rootExpr: Expr) {
  return Effect.gen(function* () {
    function getChildren(expr: Expr) {
      if (!isType(expr, ExprFactory.Call)) {
        return [];
      }

      return expr.args.items;
    }

    return new ElementLayout(
      () => rootExpr,
      (expr) => getChildren(expr),
      (expr) => expr.id,
      16,
      16
    );
  });
}
