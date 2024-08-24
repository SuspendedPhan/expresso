import { firstValueFrom } from "rxjs";
import { ExItemType, ExprType, type ExItemBase, type Expr } from "src/ex-object/ExItem";
import type { Property } from "src/ex-object/Property";
import type MainContext from "src/main-context/MainContext";
import { Utils } from "src/utils/utils/Utils";

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

export interface PropertyReferenceExpr extends ExItemBase {
  readonly itemType: ExItemType.Expr;
  readonly exprType: ExprType.PropertyReferenceExpr;
  readonly property: Property;
}

export async function createPropertyReferenceExpr(data: {
  ctx: MainContext;
  id?: string;
  property: Property;
}): Promise<PropertyReferenceExpr> {
  const id = data.id ?? Utils.createId("property-reference-expr");
  const base = await data.ctx.objectFactory.createExItemBase(id);
  return {
    ...base,
    itemType: ExItemType.Expr,
    exprType: ExprType.PropertyReferenceExpr,
    property: data.property,
  };
}