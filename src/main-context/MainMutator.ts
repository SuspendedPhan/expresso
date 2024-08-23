import { type BehaviorSubject, first, firstValueFrom, type Subject } from "rxjs";
import { createSystemCallExpr } from "src/ex-object/CallExpr";
import {
  ExItemType,
  type Expr,
  ExprType,
  type Parent,
} from "src/ex-object/ExItem";
import { ProjectFns } from "src/ex-object/Project";
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
  public async replaceWithNumberExpr(oldExpr: Expr, value: number) {
    const expr = await this.ctx.objectFactory.createNumberExpr(value);
    this.replaceWithExpr(oldExpr, expr);
  }

  @loggedMethod
  public async replaceWithCallExpr(oldExpr: Expr) {
    const expr = await createSystemCallExpr(this.ctx, {});
    this.replaceWithExpr(oldExpr, expr);
  }

  @loggedMethod
  private replaceWithExpr(oldExpr: Expr, newExpr: Expr) {
    Logger.arg("oldExpr", oldExpr.id);

    oldExpr.parent$.pipe(first()).subscribe((parent) => {
      this.replaceExpr2(parent, newExpr, oldExpr);
    });
  }

  public async replaceExpr(newExpr: Expr, oldExpr: Expr) {
    const parent = await firstValueFrom(oldExpr.parent$);
    this.replaceExpr2(parent, newExpr, oldExpr);
  }

  public replaceExpr2(parent: Parent, newExpr: Expr, oldExpr: Expr) {
    if (parent === null) {
      throw new Error("oldExpr.parent$ is null");
    }

    switch (parent.itemType) {
      case ExItemType.Property: {
        parent.expr$.next(newExpr);
        break;
      }
      case ExItemType.Expr: {
        switch (parent.exprType) {
          case ExprType.CallExpr: {
            const expr = parent;
            expr.args$.pipe(first()).subscribe((args) => {
              const newArgs = args.map((arg) =>
                arg === oldExpr ? newExpr : arg
              );
              expr.args$.next(newArgs);
            });
            break;
          }
          default:
            assertUnreachable(parent.exprType);
        }
        break;
      }
      case ExItemType.ExFunc: {
        const exFunc = parent;
        exFunc.expr$.next(newExpr);
        console.log("replaced expr in exFunc");
        
        break;
      }
      default:
        assertUnreachable;
    }

    newExpr.parent$.next(parent);
    oldExpr.destroy$.complete();
    (this.ctx.eventBus.exprReplaced$ as Subject<ExprReplacement>).next({
      oldExpr,
      newExpr,
    });
  }

  public async addBlankProjectComponent() {
    const project = await firstValueFrom(this.ctx.projectManager.currentProject$);
    ProjectFns.addComponentBlank(this.ctx, project);
  }
}
