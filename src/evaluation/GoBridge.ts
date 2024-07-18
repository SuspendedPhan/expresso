import { first, Subject } from "rxjs";
import { type Expr, ExprType } from "../ExObject";
import { loggedMethod } from "../logger/LoggerDecorator";
import type MainContext from "../main-context/MainContext";
import type GoModule from "../utils/GoModule";
import { assertUnreachable } from "../utils/Utils";

export default class GoBridge {
  private readonly ready$ByExpr = new Map<Expr, Subject<void>>();

  public constructor(goModule: GoModule, ctx: MainContext) {
    this.setup(goModule, ctx);
  }

  @loggedMethod
  private setup(goModule: GoModule, ctx: MainContext) {
    ctx.eventBus.componentAdded$.subscribe((component) => {
      goModule.Component.create(component.id);
      component.cloneCount$.subscribe((cloneCount) => {
        goModule.Component.setCloneCount(component.id, cloneCount);
      });

      for (const attribute of component.sceneAttributeByProto.values()) {
        goModule.Component.addAttribute(component.id, attribute.id);
        attribute.expr$.subscribe((expr) => {
          goModule.Attribute.setExpr(component.id, attribute.id, expr.id);
        });
      }
    });

    ctx.eventBus.onExprAdded$.subscribe((expr) => {
      switch (expr.exprType) {
        case ExprType.NumberExpr:
          goModule.NumberExpr.create(expr.id);
          goModule.NumberExpr.setValue(expr.id, expr.value);
          break;
        case ExprType.CallExpr:
          goModule.CallExpr.create(expr.id);

          expr.args$.pipe(first()).subscribe((args) => {
            const arg0 = args[0];
            const arg1 = args[1];

            if (arg0 === undefined || arg1 === undefined) {
              throw new Error("CallExpr must have 2 args");
            }

            goModule.CallExpr.setArg0(expr.id, arg0.id);
            goModule.CallExpr.setArg1(expr.id, arg1.id);
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
}
