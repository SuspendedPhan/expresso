import { Expr, ExprType } from "src/ex-object/ExObject";
import MainContext from "src/main-context/MainContext";
import { ElementLayout } from "./ElementLayout";
import { assertUnreachable } from "../utils/Utils";

export default class ComponentLayout {
  public static create(ctx: MainContext, rootExpr: Expr): ElementLayout {
    const childrenByExpr = new Map<Expr, readonly Expr[]>();

    ctx.eventBus.onExprAdded$.subscribe((expr) => {
      switch (expr.exprType) {
        case ExprType.NumberExpr:
          break;
        case ExprType.CallExpr:
          expr.args$.subscribe((args) => {
            childrenByExpr.set(expr, args);
          });
          break;
        default:
          assertUnreachable(expr);
      }
    });

    return new ElementLayout(
      () => rootExpr,
      (component) => this.getChildren(component, childrenByExpr),
      (component) => component.id,
      8,
      8
    );
  }

  static getChildren(
    component: Expr,
    childrenByComponent: Map<Expr, readonly Expr[]>
  ): readonly Expr[] {
    return childrenByComponent.get(component) ?? [];
  }
}
