import { Effect } from "effect";
import { firstValueFrom } from "rxjs";
import { CallExpr } from "src/ex-object/CallExpr";
import { ComponentParameterFactory, type ComponentParameterKind } from "src/ex-object/ComponentParameter";
import { ExFuncParameterFactory, type ExFuncParameter } from "src/ex-object/ExFuncParameter";
import { ExItem, type ExItemBase } from "src/ex-object/ExItem";
import { PropertyFactory, PropertyFns, type Property } from "src/ex-object/Property";
import type MainContext from "src/main-context/MainContext";
import { Utils } from "src/utils/utils/Utils";
import { dexScopedVariant, type DexVariantKind } from "src/utils/utils/VariantUtils4";
import { fields, isOfVariant, isType, type VariantOf } from "variant";

export type ReferenceTarget =
  | Property
  | ComponentParameterKind["Custom"]
  | ExFuncParameter;

export const ExprFactory = dexScopedVariant("Expr", {
  Number: fields<{ value: number } & ExItemBase>(),
  Reference: fields<{ target: ReferenceTarget | null } & ExItemBase>(),
});


export type Expr = VariantOf<typeof ExprFactory> | CallExpr;
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
      return expr;
    });
  },

  async Reference(
    ctx: MainContext,
    creationArgs: ExprCreationArgs["Reference"]
  ) {
    const creationArgs2: Required<ExprCreationArgs["Reference"]> = {
      id: creationArgs.id ?? Utils.createId("expr"),
      target: creationArgs.target,
    };

    const base = await ExItem.createExItemBase(creationArgs2.id);
    const expr = ExprFactory.Reference({
      ...base,
      target: creationArgs2.target,
    });
    return expr;
  },
};

export const Expr = {
  getReferenceTargetName$(target: ReferenceTarget) {
    if (isOfVariant(target, PropertyFactory)) {
      return PropertyFns.getName$(target);
    } else if (isType(target, ComponentParameterFactory.Custom)) {
      return target.name$;
    } else if (isType(target, ExFuncParameterFactory)) {
      return target.name$;
    } else {
      throw new Error("Unknown target type");
    }
  },

  async getProperty(expr: Expr) {
    let parent = await firstValueFrom(expr.parent$);
    while (parent) {
      if (isOfVariant(parent, PropertyFactory)) {
        return parent;
      }
      parent = await firstValueFrom(parent.parent$);
    }
    throw new Error("Property not found");
  },
};

