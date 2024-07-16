import {
  first,
  Observable,
  ReplaySubject,
  Subject
} from "rxjs";
import { Expr, ExprType } from "./ExObject";
import { loggedMethod } from "./logger/LoggerDecorator";
import MainContext from "./MainContext";
import type GoModule from "./utils/GoModule";
import { assertUnreachable } from "./utils/Utils";

export default class GoBridge {
  private readonly ready$ByExpr = new Map<Expr, Subject<void>>();

  public constructor(private readonly goModule: GoModule, ctx: MainContext) {
    this.setup(goModule, ctx);
  }

  @loggedMethod
  private setup(goModule: GoModule, ctx: MainContext) {
    ctx.objectFactory.onExprAdded$.subscribe((expr) => {
      switch (expr.exprType) {
        case ExprType.NumberExpr:
          goModule.addNumberExpr(expr.id);
          goModule.setNumberExprValue(expr.id, expr.value);
          break;
        case ExprType.CallExpr:
          goModule.addCallExpr(expr.id);

          expr.args$.pipe(first()).subscribe((args) => {
            const arg0 = args[0];
            const arg1 = args[1];

            if (arg0 === undefined || arg1 === undefined) {
              throw new Error("CallExpr must have 2 args");
            }

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
