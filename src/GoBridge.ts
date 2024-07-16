import {
  combineLatest,
  Observable,
  ReplaySubject
} from "rxjs";
import { Expr, ExprType } from "./ExObjectFactory";
import MainContext from "./MainContext";
import type GoModule from "./utils/GoModule";
import { assertUnreachable } from "./utils/Utils";
import { loggedMethod } from "./logger/LoggerDecorator";
import Logger from "./logger/Logger";

export default class GoBridge {
  private readonly result$ByExpr = new Map<Expr, ReplaySubject<number>>();

  public constructor(goModule: GoModule, ctx: MainContext) {
    this.setup(goModule, ctx);
  }

  @loggedMethod
  private setup(goModule: GoModule, ctx: MainContext) {
    const logger = Logger.logger();
    Logger.logCallstack();

    ctx.objectManager.onExprAdded$.subscribe((expr) => {
      const result$ = this.getOrCreateResult$(expr);

      switch (expr.exprType) {
        case ExprType.NumberExpr:
          goModule.addNumberExpr(expr.id);
          goModule.setNumberExprValue(expr.id, expr.value);
          const result = goModule.evalExpr(expr.id);
          result$.next(result);
          break;
        case ExprType.CallExpr:
          goModule.addCallExpr(expr.id);
          const callExpr = expr;
          const arg0$ = callExpr.args[0];
          const arg1$ = callExpr.args[1];
          if (arg0$ === undefined || arg1$ === undefined) {
            throw new Error("CallExpr must have 2 args");
          }

          combineLatest([arg0$, arg1$]).subscribe(([arg0, arg1]) => {
            logger.log("evaluating call expr", expr.id, arg0.id, arg1.id);
            goModule.setCallExprArg0(expr.id, arg0.id);
            goModule.setCallExprArg1(expr.id, arg1.id);
            // const result = goModule.evalExpr(expr.id);
            // result$.next(result);
          });

          break;
        default:
          assertUnreachable(expr);
      }
    });
  }

  private getOrCreateResult$(expr: Expr): ReplaySubject<number> {
    let result$ = this.result$ByExpr.get(expr);
    if (!result$) {
      result$ = new ReplaySubject<number>(1);
      this.result$ByExpr.set(expr, result$);
    }

    return result$;
  }

  public evalExpr$(expr: Expr): Observable<number> {
    const result$ = this.getOrCreateResult$(expr);
    return result$;
  }
}
