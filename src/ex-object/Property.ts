import type { ComponentParameter } from "src/ex-object/Component";
import { ExItemType, type ExItemBase, type Expr } from "src/ex-object/ExItem";
import type MainContext from "src/main-context/MainContext";
import {
  createBehaviorSubjectWithLifetime,
  type OBS,
  type SUB,
} from "src/utils/utils/Utils";

export type Property = ComponentParameterProperty | BasicProperty | CloneCountProperty;
export enum PropertyType {
  ComponentProperty,
  ObjectProperty,
  CloneCountProperty,
}

export interface PropertyBase extends ExItemBase {
  itemType: ExItemType.Property;
  expr$: SUB<Expr>;
}

export interface ComponentParameterProperty extends PropertyBase {
  propertyType: PropertyType.ComponentProperty;
  componentParameter: ComponentParameter;
}

export interface BasicProperty extends PropertyBase {
  propertyType: PropertyType.ObjectProperty;
  name$: OBS<string>;
}

export interface CloneCountProperty extends PropertyBase {
  propertyType: PropertyType.CloneCountProperty;
}

export namespace CreateProperty {
  export function componentBlank(
    ctx: MainContext,
    componentInput: ComponentParameter
  ): ComponentParameterProperty {
    const id = `component-property-${crypto.randomUUID()}`;
    const expr = ctx.objectFactory.createNumberExpr();
    return component(ctx, id, componentInput, expr);
  }
  
  export function component(
    ctx: MainContext,
    id: string,
    componentInput: ComponentParameter,
    expr: Expr
  ): ComponentParameterProperty {
    const itemBase = ctx.objectFactory.createExItemBase(id);
    const componentProperty: ComponentParameterProperty = {
      ...itemBase,
      itemType: ExItemType.Property,
      expr$: createBehaviorSubjectWithLifetime(itemBase.destroy$, expr),
      propertyType: PropertyType.ComponentProperty,
      componentParameter: componentInput,
    };
    return componentProperty;
  }
  
  export function objectBlank(
    ctx: MainContext,
    expr: Expr
  ): BasicProperty {
    const id = `object-property-${crypto.randomUUID()}`;
    const name = `Object Property`;
    return object(ctx, id, name, expr);
  }
  
  export function object(
    ctx: MainContext,
    id: string,
    name: string,
    expr: Expr
  ): BasicProperty {
    const itemBase = ctx.objectFactory.createExItemBase(id);
    const exprSub$ = createBehaviorSubjectWithLifetime(itemBase.destroy$, expr);
    const nameSub$ = createBehaviorSubjectWithLifetime(itemBase.destroy$, name);
    const property: BasicProperty = {
      ...itemBase,
      itemType: ExItemType.Property,
      expr$: exprSub$,
      name$: nameSub$,
      propertyType: PropertyType.ObjectProperty,
    };
    return property;
  }
  
  export function cloneCountBlank(
    ctx: MainContext
  ): CloneCountProperty {
    const id = `clone-count-property-${crypto.randomUUID()}`;
    const expr = ctx.objectFactory.createNumberExpr();
    return cloneCount(ctx, id, expr);
  }
  
  export function cloneCount(
    ctx: MainContext,
    id: string,
    expr: Expr
  ): CloneCountProperty {
    const itemBase = ctx.objectFactory.createExItemBase(id);
    const cloneCountProperty: CloneCountProperty = {
      ...itemBase,
      itemType: ExItemType.Property,
      expr$: createBehaviorSubjectWithLifetime(itemBase.destroy$, expr),
      propertyType: PropertyType.CloneCountProperty,
    };
    return cloneCountProperty;
  }
}
