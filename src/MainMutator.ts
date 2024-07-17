import { BehaviorSubject, first, Observable, Subject } from "rxjs";
import {
  Attribute,
  CallExpr,
  ExObject,
  ExObjectType,
  Expr,
  ExprType,
  Parent,
} from "./ExObject";
import Logger from "./logger/Logger";
import { loggedMethod } from "./logger/LoggerDecorator";
import MainContext from "./MainContext";
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

export interface ExprReplacement {
  oldExpr: Expr;
  newExpr: Expr;
}

export default class MainMutator {
  private readonly onExprReplaced$_ = new Subject<ExprReplacement>();
  public readonly onExprReplaced$: Observable<ExprReplacement> =
    this.onExprReplaced$_;

  public constructor(private readonly ctx: MainContext) {}

  public createAttribute(id?: string, expr?: Expr): Attribute {
    const attr = this.ctx.objectFactory.createAttribute(id, expr);
    return attr;
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
    this.onExprReplaced$_.next({ oldExpr, newExpr });
  }
}
