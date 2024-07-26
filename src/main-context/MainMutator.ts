import { type BehaviorSubject, first, type Subject } from "rxjs";
import { ExItemType, type Expr, ExprType, type Parent } from "src/ex-object/ExItem";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";
import { assertUnreachable } from "src/utils/utils/Utils";
import Logger from "../utils/logger/Logger";
import type MainContext from "./MainContext";
import type { ExprReplacement } from "./MainContext";

export type ExItemMutBase = {
  readonly parentSub$: BehaviorSubject<Parent>;
  readonly destroySub$: Subject<void>;
};

export default class MainMutator {
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

    oldExpr.parent$.pipe(first()).subscribe((parent) => {
      this.replaceExpr(parent, newExpr, oldExpr);
    });
  }

  private replaceExpr(parent: Parent, newExpr: Expr, oldExpr: Expr) {
    if (parent === null) {
      throw new Error("oldExpr.parent$ is null");
    }

    switch (parent) {
      case ExItemType.Property: {
        attrMut.expr$.next(newExpr);
        break;
      }
      case ExItemType.Expr: {
        switch (parent.exprType) {
          case ExprType.CallExpr: {
            const callExprMut = parent as CallExprMut;
            const args = callExprMut.argsSub$.value;
            const newArgs = args.map((arg) =>
              arg === oldExpr ? newExpr : arg
            );
            callExprMut.argsSub$.next(newArgs);
            break;
          }
          default:
            assertUnreachable(parent.exprType);
        }
        break;
      }
      default:
        assertUnreachable;
    }

    const oldExprMut = oldExpr as ExItemMut;
    const newExprMut = newExpr as ExItemMut;
    newExprMut.parentSub$.next(parent);
    oldExprMut.destroySub$.complete();
    (this.ctx.eventBus.onExprReplaced$ as Subject<ExprReplacement>).next({ oldExpr, newExpr });
  }
}
