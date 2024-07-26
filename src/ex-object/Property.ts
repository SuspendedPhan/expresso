import type { ComponentInput } from "src/ex-object/Component";
import { ExItemType, type ExItemBase, type Expr } from "src/ex-object/ExItem";
import type MainContext from "src/main-context/MainContext";
import type { ExItemMut } from "src/main-context/MainMutator";
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
  expr$: OBS<Expr>;
}

export interface ComponentProperty extends PropertyBase {
  objectType: ExItemType.Property;
  propertyType: PropertyType.ComponentProperty;
  componentInput: ComponentInput;
}

export interface ObjectProperty extends PropertyBase {
  propertyType: PropertyType.ObjectProperty;
  name$: OBS<string>;
}

export type PropertyBaseMut = ExItemMut & {
  exprSub$: SUB<Expr>;
};
export type ComponentPropertyMut = ComponentProperty & PropertyBaseMut;
export type ObjectPropertyMut = ObjectProperty &
  PropertyBaseMut & {
    nameSub$: SUB<string>;
  };

export function createComponentPropertyNew(
  ctx: MainContext,
  componentInput: ComponentInput
): ComponentProperty {
  const id = `component-property-${crypto.randomUUID()}`;
  return createComponentProperty(ctx, id, componentInput);
}

export function createComponentProperty(
  ctx: MainContext,
  id: string,
  componentInput: ComponentInput
): ComponentProperty {
  const itemBaseMut = ctx.objectFactory.createExObjectBaseMut();
  const itemBase = ctx.objectFactory.createExObjectBase(itemBaseMut, id);
  const componentProperty: ComponentPropertyMut = {
    ...itemBase,
    ...itemBaseMut,
    objectType: ExItemType.Property,
    expr$: createBehaviorSubjectWithLifetime(itemBase.destroy$, componentInput),
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
  const itemBaseMut = ctx.objectFactory.createExObjectBaseMut();
  const itemBase = ctx.objectFactory.createExObjectBase(itemBaseMut, id);
  const exprSub$ = createBehaviorSubjectWithLifetime(itemBase.destroy$, expr);
  const nameSub$ = createBehaviorSubjectWithLifetime(itemBase.destroy$, name);
  const property: ObjectPropertyMut = {
    ...itemBase,
    ...itemBaseMut,
    objectType: ExItemType.Property,
    expr$: exprSub$,
    exprSub$,
    name$: nameSub$,
    nameSub$,
    propertyType: PropertyType.ObjectProperty,
  };
  return property;
}
