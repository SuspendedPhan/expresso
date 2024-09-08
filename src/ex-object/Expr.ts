import { Effect } from "effect";
import { ExprCtx } from "src/ctx/ExprCtx";
import {
  ComponentParameterFactory,
  type ComponentParameterKind,
} from "src/ex-object/ComponentParameter";
import type { ExFunc } from "src/ex-object/ExFunc";
import {
  ExFuncParameterFactory,
  type ExFuncParameter,
} from "src/ex-object/ExFuncParameter";
import { ExItem, type ExItemBase } from "src/ex-object/ExItem";
import { Property, PropertyFactory } from "src/ex-object/Property";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import {
  createBehaviorSubjectWithLifetime,
  Utils,
  type SUB,
} from "src/utils/utils/Utils";
import {
  dexScopedVariant,
  type DexVariantKind,
} from "src/utils/utils/VariantUtils4";
import { fields, isOfVariant, isType, type VariantOf } from "variant";

export type ReferenceTarget =
  | Property
  | ComponentParameterKind["Custom"]
  | ExFuncParameter;

interface CallExpr_ extends ExItemBase {
  args$: SUB<Expr[]>;
  exFunc$: SUB<ExFunc>;
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
      return Property.getName$(target);
    } else if (isType(target, ComponentParameterFactory.Custom)) {
      return target.name$;
    } else if (isType(target, ExFuncParameterFactory)) {
      return target.name$;
    } else {
      throw new Error("Unknown target type");
    }
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
};

// public async replaceExpr(oldExpr: Expr, newExpr: Expr) {
//   const parent = await firstValueFrom(oldExpr.parent$);
//   this.replaceExpr2(parent, oldExpr, newExpr);
// }

// public replaceExpr2(parent: Parent, oldExpr: Expr, newExpr: Expr) {
//   if (parent === null) {
//     throw new Error("oldExpr.parent$ is null");
//   }

//   switch (parent.itemType) {
//     case ExItemType.Property: {
//       parent.expr$.next(newExpr);
//       break;
//     }
//     case ExItemType.Expr: {
//       switch (parent.exprType) {
//         case ExprType.CallExpr: {
//           const expr = parent;
//           expr.args$.pipe(first()).subscribe((args) => {
//             const newArgs = args.map((arg) =>
//               arg === oldExpr ? newExpr : arg
//             );
//             expr.args$.next(newArgs);
//           });
//           break;
//         }
//         default:
//           console.error("Unexpected exprType", parent.exprType);
//       }
//       break;
//     }
//     case ExItemType.ExFunc: {
//       const exFunc = parent;
//       exFunc.expr$.next(newExpr);
//       log55.debug("replaced expr in exFunc");
//       break;
//     }
//     default:
//       assertUnreachable;
//   }

//   newExpr.parent$.next(parent);
//   (this.ctx.eventBus.exprReplaced$ as Subject<ExprReplacement>).next({
//     oldExpr,
//     newExpr,
//   });
// }
