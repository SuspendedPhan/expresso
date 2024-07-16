import {
  combineLatest,
  Observable,
  ReplaySubject,
  Subject
} from "rxjs";
import { Expr, ExprType } from "./ExObjectFactory";
import MainContext from "./MainContext";
import type GoModule from "./utils/GoModule";
import { assertUnreachable } from "./utils/Utils";
import { loggedMethod } from "./logger/LoggerDecorator";
import Logger from "./logger/Logger";

export default class GoBridge {
  private readonly ready$ByExpr = new Map<Expr, Subject<void>>();

  public constructor(private readonly goModule: GoModule, ctx: MainContext) {
    this.setup(goModule, ctx);
  }

  @loggedMethod
  private setup(goModule: GoModule, ctx: MainContext) {
    const logger = Logger.logger();

    ctx.objectManager.onExprAdded$.subscribe((expr) => {
      switch (expr.exprType) {
        case ExprType.NumberExpr:
          goModule.addNumberExpr(expr.id);
          goModule.setNumberExprValue(expr.id, expr.value);
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
          });

          break;
        default:
          assertUnreachable(expr);
      }

      const ready$ = this.getOrCreateReady$(expr);
      ready$.complete();
    });
  }

  private getOrCreateReady$(expr: Expr): Subject<void> {
    let ready$ = this.ready$ByExpr.get(expr);
    if (!ready$) {
      ready$ = new Subject();
      this.ready$ByExpr.set(expr, ready$);
    }

    return ready$;
  }

  public evalExpr$(expr: Expr): Observable<number> {
    const result$ = new ReplaySubject<number>(1);
    const ready$ = this.getOrCreateReady$(expr);
    ready$.subscribe({
      complete: () => {
        const r = this.goModule.evalExpr(expr.id);
        result$.next(r);
      }
    });
    return result$;
  }
}
