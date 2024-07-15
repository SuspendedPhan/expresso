import { Observable, Subject } from "rxjs";
import ExprFactory, { Attribute, Expr } from "./ExprFactory";
import { loggedMethod } from "./logger/LoggerDecorator";
import Logger from "./logger/Logger";

let nextId = 0;

export interface ExprReplacement {
  oldExpr: Expr;
  newExpr: Expr;
}

export default class MainMutator {
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

    this.exprFactory.exprManager.replace(oldExpr, newExpr);
    this.onExprReplaced$_.next({ oldExpr, newExpr });
  }

  @loggedMethod
  public createAttribute$(): Observable<Attribute> {
    const attribute = this.exprFactory.createAttribute();
    const attribute$ = this.exprFactory.exprManager.createAttribute$(attribute);
    return attribute$;
  }
}
