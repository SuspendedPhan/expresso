import type { DexExpr } from "src/DexDomain";
import { ElementLayout } from "./ElementLayout";

export function createExprLayout(rootExpr: DexExpr) {
  function getChildren(expr: DexExpr) {
    return expr.children;
  }

  return new ElementLayout(
    () => rootExpr,
    (expr) => getChildren(expr),
    (expr) => expr.id,
    16,
    16
  );
}
