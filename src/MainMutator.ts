import { BehaviorSubject, first, Subject } from "rxjs";
import {
  Attribute,
  CallExpr,
  Component,
  ExObject,
  ExObjectType,
  Expr,
  ExprType,
  Parent,
} from "./ExObject";
import Logger from "./logger/Logger";
import { loggedMethod } from "./logger/LoggerDecorator";
import MainContext, { ExprReplacement } from "./MainContext";
import { ProtoComponentStore } from "./ProtoComponent";
import { assertUnreachable } from "./utils/Utils";

export type ExObjectMutBase = {
  readonly parentSub$: BehaviorSubject<Parent>;
  readonly destroySub$: Subject<void>;
};

export type ExObjectMut = ExObject & ExObjectMutBase;

export type AttributeMut = Attribute &
  ExObjectMut & {
    exprSub$: BehaviorSubject<Expr>;
  };

export type CallExprMut = CallExpr &
  ExObjectMut & {
    argsSub$: BehaviorSubject<Expr[]>;
  };

export default class MainMutator {
  public constructor(private readonly ctx: MainContext) {}

  public createMainObject(): Component {
    return this.ctx.objectFactory.createComponent(
      ProtoComponentStore.circle
    );
  }

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

    switch (parent.objectType) {
      case ExObjectType.Attribute: {
        const attrMut = parent as AttributeMut;
        attrMut.exprSub$.next(newExpr);
        break;
      }
      case ExObjectType.Expr: {
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

    const oldExprMut = oldExpr as ExObjectMut;
    const newExprMut = newExpr as ExObjectMut;
    newExprMut.parentSub$.next(parent);
    oldExprMut.destroySub$.complete();
    (this.ctx.onExprReplaced$ as Subject<ExprReplacement>).next({ oldExpr, newExpr });
  }
}
