import { Observable, Subject } from "rxjs";
import { Attribute, Expr } from "./ExObjectFactory";
import Logger from "./logger/Logger";
import { loggedMethod } from "./logger/LoggerDecorator";
import MainContext from "./MainContext";

export interface ExprReplacement {
  oldExpr: Expr;
  newExpr: Expr;
}

export default class MainMutator {
  private readonly onExprReplaced$_ = new Subject<ExprReplacement>();
  public readonly onExprReplaced$: Observable<ExprReplacement> =
    this.onExprReplaced$_;

  public constructor(private readonly ctx: MainContext) {}

  @loggedMethod
  public replaceWithNumberExpr(oldExpr: Expr, value: number) {
    const expr = this.ctx.objectFactory.createNumberExpr(value);
    this.replaceWithExpr(oldExpr, expr);
  }

  @loggedMethod
  public replaceWithCallExpr(oldExpr: Expr) {
    const expr = this.ctx.objectFactory.createCallExpr();
    this.replaceWithExpr(oldExpr, expr);
  }

  @loggedMethod
  private replaceWithExpr(oldExpr: Expr, newExpr: Expr) {
    Logger.arg("oldExpr", oldExpr.id);

    this.ctx.objectManager.replace(oldExpr, newExpr);
    this.onExprReplaced$_.next({ oldExpr, newExpr });
  }

  @loggedMethod
  public createAttribute$(): Observable<Attribute> {
    Logger.logCallstack();
    const attribute = this.ctx.objectFactory.createAttribute();
    const attribute$ = this.ctx.objectManager.createObject$(attribute);
    return attribute$;
  }
}
