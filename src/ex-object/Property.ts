import type MainContext from "src/main-context/MainContext";
import type { ExObjectMut } from "src/main-context/MainMutator";
import {
  createBehaviorSubjectWithLifetime,
  type OBS,
  type SUB,
} from "src/utils/utils/Utils";
import { ExItemType, type ExObjectBase, type Expr } from "./ExObject";
import type { ProtoSceneProperty } from "./SceneAttribute";
import type { ComponentInput } from "./Component";

export enum PropertyType {
  ComponentProperty,
  SceneProperty,
  ObjectProperty,
}
export interface PropertyBase extends ExObjectBase {
  expr$: OBS<Expr>;
}

export interface ComponentProperty extends PropertyBase {
  objectType: ExItemType.Property;
  propertyType: PropertyType.ComponentProperty;
  componentInput: ComponentInput;
}

export interface SceneProperty extends ComponentProperty {
  proto: ProtoSceneProperty;
}

export interface ObjectProperty extends PropertyBase {
  propertyType: PropertyType.ObjectProperty;
  name$: OBS<string>;
}

export type PropertyBaseMut = ExObjectMut & {
  exprSub$: SUB<Expr>;
};
export type ComponentPropertyMut = ComponentProperty & PropertyBaseMut;
export type ScenePropertyMut = SceneProperty & PropertyBaseMut;
export type ObjectPropertyMut = ObjectProperty &
  PropertyBaseMut & {
    nameSub$: SUB<string>;
  };

export function createScenePropertyNew(
  ctx: MainContext,
  proto: ProtoSceneProperty
): SceneProperty {
  const id = `scene-property-${crypto.randomUUID()}`;
  const expr = ctx.objectFactory.createNumberExpr(0);
  return createSceneProperty(ctx, id, expr, proto);
}

export function createSceneProperty(
  ctx: MainContext,
  id: string,
  expr: Expr,
  proto: ProtoSceneProperty
): SceneProperty {
  const itemBaseMut = ctx.objectFactory.createExObjectBaseMut();
  const itemBase = ctx.objectFactory.createExObjectBase(itemBaseMut, id);
  const exprSub$ = createBehaviorSubjectWithLifetime(itemBase.destroy$, expr);
  const property: ScenePropertyMut = {
    ...itemBase,
    ...itemBaseMut,
    objectType: ExItemType.SceneProperty,
    expr$: exprSub$,
    exprSub$,
    proto,
    propertyType: PropertyType.SceneProperty,
  };
  return property;
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
