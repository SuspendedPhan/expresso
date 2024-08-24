import { firstValueFrom } from "rxjs";
import { ExItemType, ExprType, type ExItemBase, type Expr } from "src/ex-object/ExItem";
import type { Property } from "src/ex-object/Property";

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