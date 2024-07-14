import { BehaviorSubject, Observable, Subject } from "rxjs";
import ExprFactory, { Expr } from "./ExprFactory";
import { loggedMethod } from "./logger/LoggerDecorator";
import Logger from "./logger/Logger";

export interface ExprReplacement {
  oldExpr: Expr;
  newExpr: Expr;
}

export default class Replacer {
  private readonly onExprReplaced$_ = new Subject<ExprReplacement>();
  public readonly onExprReplaced$: Observable<ExprReplacement> =
    this.onExprReplaced$_;

  public constructor(private readonly exprFactory: ExprFactory) {}

  @loggedMethod
  public replaceWithNumberExpr(expr$: BehaviorSubject<Expr>, value: number) {
    const expr = this.exprFactory.createNumberExpr(value);
    this.replaceWithExpr(expr$, expr);
  }

  @loggedMethod
  public replaceWithCallExpr(expr$: BehaviorSubject<Expr>) {
    const expr = this.exprFactory.createCallExpr();
    this.replaceWithExpr(expr$, expr);
  }
  @loggedMethod
  private replaceWithExpr(expr$: BehaviorSubject<Expr>, newExpr: Expr) {
    Logger.logCallstack();
    const oldExpr = expr$.value;
    const parent = expr$.value.parent$.value;
    newExpr.parent$.next(parent);
    expr$.next(newExpr);

    this.onExprReplaced$_.next({ oldExpr, newExpr });
    return newExpr;
  }
}
