import { BehaviorSubject } from "rxjs";
import { Expr, Parent } from "./ExprFactory";
import { loggedMethod } from "./logger/LoggerDecorator";
import Logger from "./logger/Logger";

interface ExprMut {
  parent$: BehaviorSubject<Parent>;
  expr$: BehaviorSubject<Expr>;
}

export default class ExprManager {
  private readonly exprMutByExpr = new Map<Expr, ExprMut>();

  @loggedMethod
  public create$(expr: Expr): BehaviorSubject<Expr> {
    Logger.logCallstack();
    Logger.arg("expr", expr.id);
    const mut = {
      parent$: new BehaviorSubject<Parent>(null),
      expr$: new BehaviorSubject<Expr>(expr),
    };

    this.exprMutByExpr.set(expr, mut);
    return mut.expr$;
  }

  public replace(expr: Expr, newExpr: Expr) {
    const mut = this.exprMutByExpr.get(expr);
    if (!mut) {
      throw new Error(`expr$ not found for ${expr}`);
    }
    this.exprMutByExpr.set(newExpr, mut);
    this.exprMutByExpr.delete(expr);
    mut.expr$.next(newExpr);
  }

  public getParent$(expr: Expr): BehaviorSubject<Parent> {
    const mut = this.exprMutByExpr.get(expr);
    if (!mut) {
      throw new Error(`expr$ not found for ${expr}`);
    }
    return mut.parent$;
  }
}
