import { first, Observable, Subject } from "rxjs";
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
  public replaceWithNumberExpr(oldExpr: Expr, value: number) {
    const expr = this.exprFactory.createNumberExpr(value);
    this.replaceWithExpr(oldExpr, expr);
  }

  @loggedMethod
  public replaceWithCallExpr(oldExpr: Expr) {
    const expr = this.exprFactory.createCallExpr();
    this.replaceWithExpr(oldExpr, expr);
  }
  @loggedMethod
  private replaceWithExpr(oldExpr: Expr, newExpr: Expr) {
    Logger.arg("oldExpr", oldExpr.id);
    Logger.logCallstack();

    const parent$ = this.exprFactory.exprManager.getParent$(oldExpr);
    parent$.pipe(first()).subscribe((parent) => {
      this.exprFactory.exprManager.setParent(newExpr, parent);
    });
    
    this.exprFactory.exprManager.replace(oldExpr, newExpr);
    this.onExprReplaced$_.next({ oldExpr, newExpr });
  }
}
