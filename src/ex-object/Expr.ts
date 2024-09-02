import { firstValueFrom } from "rxjs";
import type { CustomComponentParameter } from "src/ex-object/Component";
import type { ExFuncParameter } from "src/ex-object/ExFunc";
import {
  ExItemType,
  ExprType,
  type ExItemBase,
  type Expr
} from "src/ex-object/ExItem";
import { PropertyFns, type Property } from "src/ex-object/Property";
import type MainContext from "src/main-context/MainContext";
import { Utils, type OBS } from "src/utils/utils/Utils";
import type { DexVariantKind } from "src/utils/utils/VariantUtils4";
import {
  fields,
  variantCosmos,
  type VariantOf
} from "variant";

export namespace ExprFuncs {
  export async function getProperty(expr: Expr) {
    let parent = await firstValueFrom(expr.parent$);
    while (parent) {
      if (parent.itemType === ExItemType.Property) {
        return parent;
      }
      parent = await firstValueFrom(parent.parent$);
    }
    throw new Error("Property not found");
  }
}

export async function createReferenceExpr(
  ctx: MainContext,
  data: {
    id?: string;
    reference2: ReferenceExpr2;
  }
): Promise<ReferenceExpr> {
  const id = data.id ?? Utils.createId("reference-expr");
  const base = await ctx.objectFactory.createExItemBase(id);
  const expr = {
    ...base,
    itemType: ExItemType.Expr,
    exprType: ExprType.ReferenceExpr,
    reference: data.reference2,
    get name$(): OBS<string> {
      return ReferenceExpr2Cosmos.matcher(this.reference)
        .when(ReferenceExpr2.Property, ({ target }) => PropertyFns.getName$(target))
        .else(x => x.target.name$);
    }
  } as ReferenceExpr;
  return expr;
}

export interface ReferenceExpr extends ExItemBase {
  itemType: ExItemType.Expr;
  exprType: ExprType.ReferenceExpr;
  reference: ReferenceExpr2;
  get name$(): OBS<string>;
}

const REFERENCE_EXPR2_TAG = "referenceExpr2Kind";
export const ReferenceExpr2Cosmos = variantCosmos({ key: REFERENCE_EXPR2_TAG });

export const ReferenceExpr2 = ReferenceExpr2Cosmos.variant({
  Property: fields<{ target: Property }>(),
  ComponentParameter: fields<{ target: CustomComponentParameter }>(),
  ExFuncParameter: fields<{ target: ExFuncParameter }>(),
});

export type ReferenceExpr2 = VariantOf<typeof ReferenceExpr2>;
export type ReferenceExpr2Kind = DexVariantKind<typeof ReferenceExpr2, typeof REFERENCE_EXPR2_TAG>;
