import { first, Subject, switchMap } from "rxjs";
import { type Expr, ExprType } from "src/ex-object/ExItem";
import type MainContext from "src/main-context/MainContext";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";
import type GoModule from "src/utils/utils/GoModule";
import { assertUnreachable } from "src/utils/utils/Utils";

export default class GoBridge {
  private readonly ready$ByExpr = new Map<Expr, Subject<void>>();

  public constructor(goModule: GoModule, ctx: MainContext) {
    this.setup(goModule, ctx);
  }

  @loggedMethod
  private setup(goModule: GoModule, ctx: MainContext) {
    ctx.eventBus.objectAdded$.subscribe((object) => {
      goModule.Object.create(object.id);

      object.cloneCountProperty.expr$.subscribe((expr) => {
        goModule.Object.setCloneCount(object.id, expr.id);
      });

      for (const property of object.componentParameterProperties) {
        goModule.Object.addProperty(object.id, property.id);
        property.expr$.subscribe((expr) => {
          goModule.Property.setExpr(object.id, property.id, expr.id);
        });
      }
    });

    ctx.eventBus.exprAdded$.subscribe((expr) => {
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
