import { firstValueFrom } from "rxjs";
import type { CustomComponentParameter } from "src/ex-object/Component";
import type { ExFuncParameter } from "src/ex-object/ExFunc";
import { ExItemType, ExprType, type ExItem, type ExItemBase, type Expr } from "src/ex-object/ExItem";
import type { Property } from "src/ex-object/Property";
import type MainContext from "src/main-context/MainContext";
import { Utils } from "src/utils/utils/Utils";
import { fields, payload, variantModule, type TypeNames, type VariantOf } from "variant";

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

export interface ComponentParameterReferenceExpr extends ExItemBase {
  readonly itemType: ExItemType.Expr;
  readonly exprType: ExprType.ComponentParameterReferenceExpr;
  readonly parameter: CustomComponentParameter;
}

export async function createComponentParameterReferenceExpr(data: {
  ctx: MainContext;
  id?: string;
  parameter: CustomComponentParameter;
}): Promise<ComponentParameterReferenceExpr> {
  const id = data.id ?? Utils.createId("component-parameter-reference-expr");
  const base = await data.ctx.objectFactory.createExItemBase(id);
  const expr: ComponentParameterReferenceExpr = {
    ...base,
    itemType: ExItemType.Expr,
    exprType: ExprType.ComponentParameterReferenceExpr,
    parameter: data.parameter,
  };
  return expr;
}

export interface ExFuncParameterReferenceExpr extends ExItemBase {
  readonly itemType: ExItemType.Expr;
  readonly exprType: ExprType.ExFuncParameterReferenceExpr;
  readonly parameter: ExFuncParameter;
}

export async function createExFuncParameterReferenceExpr(data: {
  ctx: MainContext;
  id?: string;
  parameter: ExFuncParameter;
}): Promise<ExFuncParameterReferenceExpr> {
  const id = data.id ?? Utils.createId("ex-func-parameter-reference-expr");
  const base = await data.ctx.objectFactory.createExItemBase(id);
  const expr: ExFuncParameterReferenceExpr = {
    ...base,
    itemType: ExItemType.Expr,
    exprType: ExprType.ExFuncParameterReferenceExpr,
    parameter: data.parameter,
  };
  return expr;
}

interface ReferenceExpr extends ExItemBase {
  itemType: ExItemType.Expr;
  reference: ReferenceExpr2;
}

const ReferenceExpr2 = variantModule({
  Property: fields<{property: Property}>(),
  ComponentParameter: fields<{parameter: CustomComponentParameter}>(),
  ExFuncParameter: fields<{parameter: ExFuncParameter}>(),
});

export type ReferenceExpr2<T extends TypeNames<typeof ReferenceExpr2> = undefined>
    = VariantOf<typeof ReferenceExpr2, T>;