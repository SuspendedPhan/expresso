import { type BehaviorSubject, first, type Subject } from "rxjs";
import {
  type Attribute,
  type CallExpr,
  type Component,
  type ExObject,
  ExItemType,
  type Expr,
  ExprType,
  type Parent,
  type ExObjectBase,
} from "src/ex-object/ExObject";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";
import { assertUnreachable } from "src/utils/utils/Utils";
import Logger from "../utils/logger/Logger";
import type MainContext from "./MainContext";
import type { ExprReplacement } from "./MainContext";

export type ExItemMutBase = {
  readonly parentSub$: BehaviorSubject<Parent>;
  readonly destroySub$: Subject<void>;
};

export type ExItemMut = ExObjectBase & ExItemMutBase;

export type ComponentMut = Component & ExItemMut & {
  // cloneCountSub$: BehaviorSubject<number>;
  // childrenSub$: BehaviorSubject<readonly Component[]>;
  // sceneAttributeAddedSub$: Subject<SceneAttribute>;
};

export type AttributeMut = Attribute &
  ExItemMut & {
    exprSub$: BehaviorSubject<Expr>;
  };

export type CallExprMut = CallExpr &
  ExItemMut & {
    argsSub$: BehaviorSubject<Expr[]>;
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

    switch (parent.objectType) {
      case ExItemType.Property: {
        const attrMut = parent as AttributeMut;
        attrMut.exprSub$.next(newExpr);
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
