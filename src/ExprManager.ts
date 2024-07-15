import { BehaviorSubject, Observable, of, switchAll } from "rxjs";
import { Attribute, ExObject, Expr, Parent } from "./ExprFactory";
import { loggedMethod } from "./logger/LoggerDecorator";
import Logger from "./logger/Logger";

interface ExprMut {
  parent$$: BehaviorSubject<Observable<Parent>>;
  expr$: BehaviorSubject<Expr>;
}

export default class ExprManager {
  private readonly exprMutByExpr = new Map<Expr, ExprMut>();
  private readonly parent$ByParent = new Map<Parent, Observable<Parent>>();

  public createAttribute$(attribute: Attribute): Observable<Attribute> {
    const attribute$ = new BehaviorSubject<Attribute>(attribute);
    this.parent$ByParent.set(attribute, attribute$);
    attribute.expr$.subscribe((expr) => {
        this.setParent(expr, attribute);
    });
    return attribute$;
  }

  @loggedMethod
  public createExpr$(expr: Expr) {
    Logger.logCallstack();
    Logger.arg("expr", expr.id);
    const mut = {
      parent$$: new BehaviorSubject<Observable<Parent>>(of()),
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

  public setParent(expr: Expr, parent: Parent) {
    const mut = this.exprMutByExpr.get(expr);
    if (!mut) {
      throw new Error(`expr$ not found for ${expr}`);
    }

    const parent$ = this.parent$ByParent.get(parent);
    if (!parent$) {
      throw new Error(`parent$ not found for ${parent}`);
    }
    mut.parent$$.next(parent$);
  }

  public getParent$(expr: Expr): Observable<Parent> {
    const mut = this.exprMutByExpr.get(expr);
    if (!mut) {
      throw new Error(`expr$ not found for ${expr}`);
    }
    return mut.parent$$.pipe(switchAll());
  }
}
