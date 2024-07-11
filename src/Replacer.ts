import { BehaviorSubject, Observable, Subject } from "rxjs";
import ExprFactory, { Expr } from "./ExprFactory";

export interface ExprReplacement {
  oldExpr: Expr;
  newExpr: Expr;
}

export default class Replacer {
  private readonly onExprReplaced$_ = new Subject<ExprReplacement>();
  public readonly onExprReplaced$: Observable<ExprReplacement> =
    this.onExprReplaced$_;

  public constructor(private readonly exprFactory: ExprFactory) {}

  public replaceWithNumberExpr(expr$: BehaviorSubject<Expr>, value: number) {
    const expr = this.exprFactory.createNumberExpr(value);
    this.replaceWithExpr(expr$, expr);
  }

  public replaceWithCallExpr(expr$: BehaviorSubject<Expr>) {
    const expr = this.exprFactory.createCallExpr();
    this.replaceWithExpr(expr$, expr);
  }

  private replaceWithExpr(expr$: BehaviorSubject<Expr>, newExpr: Expr) {
    const oldExpr = expr$.value;
    const parent = expr$.value.parent$.value;
    newExpr.parent$.next(parent);
    expr$.next(newExpr);

    this.onExprReplaced$_.next({ oldExpr, newExpr });
    return newExpr;
  }
}
