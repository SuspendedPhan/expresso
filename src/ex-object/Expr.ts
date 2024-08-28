import { firstValueFrom } from "rxjs";
import type { CustomComponentParameter } from "src/ex-object/Component";
import type { ExFuncParameter } from "src/ex-object/ExFunc";
import { ExItemType, ExprType, type ExItem, type ExItemBase, type Expr } from "src/ex-object/ExItem";
import type { Property } from "src/ex-object/Property";
import type MainContext from "src/main-context/MainContext";
import { Utils } from "src/utils/utils/Utils";
import { fields, variantModule, type TypeNames, type VariantOf } from "variant";

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

export async function createReferenceExpr(ctx: MainContext, data: {
  id?: string;
  parent: ExItem;
  reference: ReferenceExpr2;
}): Promise<ReferenceExpr> {
  const id = data.id ?? Utils.createId("reference-expr");
  const base = await ctx.objectFactory.createExItemBase(id);
  return {
    ...base,
    itemType: ExItemType.Expr,
    exprType: ExprType.ReferenceExpr,
    reference: data.reference,
  };
}

export interface ReferenceExpr extends ExItemBase {
  itemType: ExItemType.Expr;
  exprType: ExprType.ReferenceExpr;
  reference: ReferenceExpr2;
}

export const ReferenceExpr2 = variantModule({
  Property: fields<{property: Property}>(),
  ComponentParameter: fields<{parameter: CustomComponentParameter}>(),
  ExFuncParameter: fields<{parameter: ExFuncParameter}>(),
});

export type ReferenceExpr2<T extends TypeNames<typeof ReferenceExpr2> = undefined>
    = VariantOf<typeof ReferenceExpr2, T>;