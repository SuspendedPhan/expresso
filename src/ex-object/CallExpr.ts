import { firstValueFrom, Subject } from "rxjs";
import {
  SystemExFuncKind,
  type ExFunc,
  type SystemExFunc,
} from "src/ex-object/ExFunc";
import {
  ExItemType,
  ExprType,
  type CallExpr,
  type ExItemBase,
  type Expr,
} from "src/ex-object/ExItem";
import type MainContext from "src/main-context/MainContext";
import {
  createBehaviorSubjectWithLifetime,
  Utils,
  type SUB,
} from "src/utils/utils/Utils";
import unionize, { ofType } from "unionize";

interface CallExprBase extends ExItemBase {
  readonly itemType: ExItemType.Expr;
  readonly exprType: ExprType.CallExpr;
  readonly args$: SUB<Expr[]>;
}

export const CallExprKind = unionize({
  Custom: ofType<{ exFunc: ExFunc } & CallExprBase>(),
  System: ofType<{ systemExFunc: SystemExFunc } & CallExprBase>(),
});

export async function createCallExprBase(
  ctx: MainContext,
  data: {
    id?: string;
    args?: Expr[];
  }
): Promise<CallExprBase> {
  const id = data.id ?? Utils.createId("call-expr");
  const base = await ctx.objectFactory.createExItemBase(id);
  const args = data.args ?? [];

  return {
    ...base,
    itemType: ExItemType.Expr,
    exprType: ExprType.CallExpr,
    args$: createBehaviorSubjectWithLifetime<Expr[]>(base.destroy$, args),
    ...data,
  };
}

export async function createCustomCallExpr(
  ctx: MainContext,
  data: {
    exFunc: ExFunc;
    base: CallExprBase;
  }
) {
  return createCallExpr(ctx, () => {
    return CallExprKind.Custom({
      ...data.base,
      ...data,
    });
  });
}

export async function createSystemCallExpr(
  ctx: MainContext,
  data: {
    systemExFunc?: SystemExFunc;
    base?: CallExprBase;
  }
): Promise<CallExpr> {
  let base = data.base;
  if (base === undefined) {
    const args = [];
    args[0] = await ctx.objectFactory.createNumberExpr();
    args[1] = await ctx.objectFactory.createNumberExpr();
    base = await createCallExprBase(ctx, { args });
  }
  const systemExFunc = data.systemExFunc ?? SystemExFuncKind.Add();

  return createCallExpr(ctx, () => {
    return CallExprKind.System({
      ...base,
      systemExFunc,
    });
  });
}

async function createCallExpr(ctx: MainContext, factory: () => CallExpr) {
  const expr = factory();
  const args = await firstValueFrom(expr.args$);
  for (const arg of args) {
    arg.parent$.next(expr);
  }

  (ctx.eventBus.exprAdded$ as Subject<Expr>).next(expr);
  return expr;
}
