import assert from "assert-ts";
import { Effect, Stream } from "effect";
import { Expr, ExprFactory } from "src/ex-object/Expr";
import { isOfVariant } from "variant";
import { ElementLayout } from "./ElementLayout";

export function createExprLayout(rootExpr: Expr) {
  return Effect.gen(function* () {
    const childrenByExpr = new Map<Expr, readonly Expr[]>();

    function getChildren(expr: Expr) {
      return childrenByExpr.get(expr) ?? [];
    }

    yield* Effect.forkDaemon(
      Stream.runForEach(Expr.descendants2(rootExpr), (value) => {
        return Effect.gen(function* () {
          if (value.type !== "ItemAdded") {
            return;
          }

          const parent = yield* value.item.parent.get;
          if (parent === null) {
            return;
          }

          assert(isOfVariant(parent, ExprFactory));

          const children = childrenByExpr.get(parent) ?? [];
          childrenByExpr.set(parent, [...children, value.item]);
        });
      })
    );

    return new ElementLayout(
      () => rootExpr,
      (expr) => getChildren(expr),
      (expr) => expr.id,
      16,
      16
    );
  });
}
