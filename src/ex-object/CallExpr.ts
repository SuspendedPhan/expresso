import { Subject } from "rxjs";
import {
  SystemExFuncKind,
  type ExFunc,
  type SystemExFunc,
} from "src/ex-object/ExFunc";
import {
  type ExItemBase,
  type Expr
} from "src/ex-object/ExItem";
import type MainContext from "src/main-context/MainContext";
import {
  createBehaviorSubjectWithLifetime,
  Utils,
  type SUB,
} from "src/utils/utils/Utils";
import type { DexVariantKind } from "src/utils/utils/VariantUtils4";
import { fields, variant, type VariantOf } from "variant";

interface CallExprBase extends ExItemBase {
  readonly args$: SUB<Expr[]>;
}

interface CallExprCreationArgs {
  Custom: {
    id?: string;
    exFunc: ExFunc;
    args?: Expr[];
  };

  System: {
    id?: string;
    systemExFunc?: SystemExFunc;
    args?: Expr[];
  };
}

export const CallExpr = {
  creators: variant({
    Custom: fields<{ exFunc: ExFunc } & CallExprBase>(),
    System: fields<{ systemExFunc: SystemExFunc } & CallExprBase>(),
  }),

  creators2: {
    async Custom(ctx: MainContext, creationArgs: CallExprCreationArgs["Custom"]) {
      const creationArgs2: Required<CallExprCreationArgs["Custom"]> = {
        id: creationArgs.id ?? Utils.createId("call-expr"),
        args: creationArgs.args ?? [],
        exFunc: creationArgs.exFunc,
      };

      const base = await ctx.objectFactory.createExItemBase(creationArgs2.id);
      const expr = CallExpr.creators.Custom({
        ...base,
        args$: createBehaviorSubjectWithLifetime(base.destroy$, creationArgs2.args),
        exFunc: creationArgs2.exFunc,
      });

      for (const arg of creationArgs2.args) {
        arg.parent$.next(expr);
      }
      (ctx.eventBus.exprAdded$ as Subject<Expr>).next(expr);
      return expr;
    },

    async System(ctx: MainContext, creationArgs: CallExprCreationArgs["System"]) {
      const creationArgs2: Required<CallExprCreationArgs["System"]> = {
        id: creationArgs.id ?? Utils.createId("call-expr"),
        args: creationArgs.args ?? [],
        systemExFunc: creationArgs.systemExFunc ?? SystemExFuncKind.Add(),
      };

      const base = await ctx.objectFactory.createExItemBase(creationArgs2.id);
      const expr = CallExpr.creators.System({
        ...base,
        args$: createBehaviorSubjectWithLifetime(base.destroy$, creationArgs2.args),
        systemExFunc: creationArgs2.systemExFunc,
      });

      for (const arg of creationArgs2.args) {
        arg.parent$.next(expr);
      }
      (ctx.eventBus.exprAdded$ as Subject<Expr>).next(expr);
      return expr;
    }
  },
};

export type CallExpr = VariantOf<typeof CallExpr.creators>;
export type CallExprKind = DexVariantKind<typeof CallExpr.creators>;
