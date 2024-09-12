import assert from "assert-ts";
import { Effect } from "effect";
import { ExprCtx } from "src/ctx/ExprCtx";
import {
  ComponentParameterFactory,
  type ComponentParameterKind,
} from "src/ex-object/ComponentParameter";
import { CustomExFuncFactory, type ExFunc } from "src/ex-object/ExFunc";
import {
  ExFuncParameterFactory,
  type ExFuncParameter,
} from "src/ex-object/ExFuncParameter";
import { ExItem, type ExItemBase } from "src/ex-object/ExItem";
import { Property, PropertyFactory } from "src/ex-object/Property";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import { log5 } from "src/utils/utils/Log5";
import {
  createBehaviorSubjectWithLifetime,
  Utils,
  type BSUB,
  type SUB,
} from "src/utils/utils/Utils";
import {
  dexScopedVariant,
  type DexVariantKind,
} from "src/utils/utils/VariantUtils4";
import { fields, isOfVariant, isType, type VariantOf } from "variant";

const log55 = log5("Expr.ts");

export interface ExprReplacement {
  oldExpr: Expr;
  newExpr: Expr;
}

export type ReferenceTarget =
  | Property
  | ComponentParameterKind["Custom"]
  | ExFuncParameter;

interface CallExpr_ extends ExItemBase {
  args$: SUB<Expr[]>;
  exFunc$: BSUB<ExFunc>;
}

export const ExprFactory = dexScopedVariant("Expr", {
  Number: fields<{ value: number } & ExItemBase>(),
  Reference: fields<{ target: ReferenceTarget | null } & ExItemBase>(),
  Call: fields<CallExpr_>(),
});

export type Expr = VariantOf<typeof ExprFactory>;
export type ExprKind = DexVariantKind<typeof ExprFactory>;

interface ExprCreationArgs {
  Number: {
    id?: string;
    value?: number;
  };

  Reference: {
    id?: string;
    target: ReferenceTarget | null;
  };

  CallExpr: {
    id?: string;
    exFunc: ExFunc;
    args?: Expr[];
  };
}

export const ExprFactory2 = {
  Number(creationArgs: ExprCreationArgs["Number"]) {
    return Effect.gen(function* () {
      const creationArgs2: Required<ExprCreationArgs["Number"]> = {
        id: creationArgs.id ?? Utils.createId("expr"),
        value: creationArgs.value ?? 0,
      };

      const base = yield* ExItem.createExItemBase(creationArgs2.id);
      const expr = ExprFactory.Number({
        ...base,
        value: creationArgs2.value,
      });
      (yield* ExprCtx).exprs.push(expr);
      return expr;
    });
  },

  Reference(creationArgs: ExprCreationArgs["Reference"]) {
    return Effect.gen(function* () {
      const creationArgs2: Required<ExprCreationArgs["Reference"]> = {
        id: creationArgs.id ?? Utils.createId("expr"),
        target: creationArgs.target,
      };

      const base = yield* ExItem.createExItemBase(creationArgs2.id);
      const expr = ExprFactory.Reference({
        ...base,
        target: creationArgs2.target,
      });
      (yield* ExprCtx).exprs.push(expr);
      return expr;
    });
  },

  Call: (creationArgs: ExprCreationArgs["CallExpr"]) => {
    return Effect.gen(function* () {
      const creationArgs2: Required<ExprCreationArgs["CallExpr"]> = {
        id: creationArgs.id ?? Utils.createId("call-expr"),
        args: creationArgs.args ?? [],
        exFunc: creationArgs.exFunc,
      };

      const base = yield* ExItem.createExItemBase(creationArgs2.id);
      const expr = ExprFactory.Call({
        ...base,
        args$: createBehaviorSubjectWithLifetime(
          base.destroy$,
          creationArgs2.args
        ),
        exFunc$: createBehaviorSubjectWithLifetime(
          base.destroy$,
          creationArgs2.exFunc
        ),
      });

      for (const arg of creationArgs2.args) {
        arg.parent$.next(expr);
      }

      (yield* ExprCtx).exprs.push(expr);
      return expr;
    });
  },
};

export const Expr = {
  getReferenceTargetName$(target: ReferenceTarget) {
    if (isOfVariant(target, PropertyFactory)) {
      return Property.Methods(target).getName$();
    }

    if (isType(target, ComponentParameterFactory.Custom)) {
      return target.name$;
    }

    if (isType(target, ExFuncParameterFactory)) {
      return target.name$;
    }

    throw new Error("Unknown target type");
  },

  getProperty(expr: Expr) {
    return Effect.gen(function* () {
      let parent = yield* EffectUtils.firstValueFrom(expr.parent$);
      while (parent) {
        if (isOfVariant(parent, PropertyFactory)) {
          return parent;
        }
        parent = yield* EffectUtils.firstValueFrom(parent.parent$);
      }
      throw new Error("Property not found");
    });
  },

  replaceExpr(oldExpr: Expr, newExpr: Expr) {
    return Effect.gen(function* () {
      log55.debug("replaceExpr", oldExpr, newExpr);
      const parent = yield* EffectUtils.firstValueFrom(oldExpr.parent$);
      if (!parent) {
        throw new Error("oldExpr.parent$ is null");
      }

      if (isOfVariant(parent, PropertyFactory)) {
        parent.expr$.next(newExpr);
      } else if (isOfVariant(parent, ExprFactory)) {
        assert(isType(parent, ExprFactory.Call));

        const args = yield* EffectUtils.firstValueFrom(parent.args$);
        const newArgs = args.map((arg) => (arg === oldExpr ? newExpr : arg));
        parent.args$.next(newArgs);
      } else if (isType(parent, CustomExFuncFactory)) {
        parent.expr$.next(newExpr);
      } else {
        throw new Error("Unexpected itemType");
      }

      newExpr.parent$.next(parent);
    });
  },
};

