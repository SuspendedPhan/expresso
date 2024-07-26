import type { ComponentInput } from "src/ex-object/Component";
import { ExItemType, type ExItemBase, type Expr } from "src/ex-object/ExItem";
import type MainContext from "src/main-context/MainContext";
import {
  createBehaviorSubjectWithLifetime,
  type OBS,
  type SUB,
} from "src/utils/utils/Utils";

export type Property = ComponentProperty | ObjectProperty;
export enum PropertyType {
  ComponentProperty,
  ObjectProperty,
}

export interface PropertyBase extends ExItemBase {
  itemType: ExItemType.Property;
  expr$: SUB<Expr>;
}

export interface ComponentProperty extends PropertyBase {
  propertyType: PropertyType.ComponentProperty;
  componentInput: ComponentInput;
}

export interface ObjectProperty extends PropertyBase {
  propertyType: PropertyType.ObjectProperty;
  name$: OBS<string>;
}

export function createComponentPropertyNew(
  ctx: MainContext,
  componentInput: ComponentInput
): ComponentProperty {
  const id = `component-property-${crypto.randomUUID()}`;
  const expr = ctx.objectFactory.createNumberExpr();
  return createComponentProperty(ctx, id, componentInput, expr);
}

export function createComponentProperty(
  ctx: MainContext,
  id: string,
  componentInput: ComponentInput,
  expr: Expr
): ComponentProperty {
  const itemBase = ctx.objectFactory.createExItemBase(id);
  const componentProperty: ComponentProperty = {
    ...itemBase,
    itemType: ExItemType.Property,
    expr$: createBehaviorSubjectWithLifetime(itemBase.destroy$, expr),
    propertyType: PropertyType.ComponentProperty,
    componentInput,
  };
  return componentProperty;
}

export function createObjectPropertyNew(
  ctx: MainContext,
  expr: Expr
): ObjectProperty {
  const id = `object-property-${crypto.randomUUID()}`;
  const name = `Object Property`;
  return createObjectProperty(ctx, id, name, expr);
}

export function createObjectProperty(
  ctx: MainContext,
  id: string,
  name: string,
  expr: Expr
): ObjectProperty {
  const itemBase = ctx.objectFactory.createExItemBase(id);
  const exprSub$ = createBehaviorSubjectWithLifetime(itemBase.destroy$, expr);
  const nameSub$ = createBehaviorSubjectWithLifetime(itemBase.destroy$, name);
  const property: ObjectProperty = {
    ...itemBase,
    itemType: ExItemType.Property,
    expr$: exprSub$,
    name$: nameSub$,
    propertyType: PropertyType.ObjectProperty,
  };
  return property;
}
