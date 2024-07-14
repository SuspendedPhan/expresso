import { BehaviorSubject } from "rxjs";
import { Expr, Parent } from "./ExprFactory";
import { loggedMethod } from "./logger/LoggerDecorator";
import Logger from "./logger/Logger";

interface ExprMut {
  parent$: BehaviorSubject<Parent>;
  expr$: BehaviorSubject<Expr>;
}

export default class ExprManager {
  private readonly exprMut$ByExpr_ = new Map<Expr, BehaviorSubject<Expr>>();
  private readonly parent$ByExpr_ = new Map<Expr, BehaviorSubject<Parent>>();

  @loggedMethod
  public create$(expr: Expr): BehaviorSubject<Expr> {
    Logger.logCallstack();
    Logger.arg("expr", expr.id);
    const expr$ = new BehaviorSubject<Expr>(expr);
    this.exprMut$ByExpr_.set(expr, expr$);
    this.parent$ByExpr_.set(expr, new BehaviorSubject<Parent>(null));
    return expr$;
  }

  public replace(expr: Expr, newExpr: Expr) {
    const expr$ = this.exprMut$ByExpr_.get(expr);
    if (!expr$) {
      throw new Error(`expr$ not found for ${expr}`);
    }
    this.exprMut$ByExpr_.set(newExpr, expr$);
    this.exprMut$ByExpr_.delete(expr);
    expr$.next(newExpr);
  }

  public setParent(expr: Expr, parent: Expr) {
    const expr$ = this.exprMut$ByExpr_.get(expr);
    if (!expr$) {
      throw new Error(`expr$ not found for ${expr}`);
    }
    expr$.next(parent);
  }
}
