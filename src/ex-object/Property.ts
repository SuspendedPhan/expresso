import { of } from "rxjs";
import { ComponentParameterUtils, type ComponentParameter } from "src/ex-object/Component";
import { ExItemType, type ExItemBase, type Expr } from "src/ex-object/ExItem";
import type MainContext from "src/main-context/MainContext";
import {
  createBehaviorSubjectWithLifetime,
  type OBS,
  type SUB,
} from "src/utils/utils/Utils";

export type Property =
  | ComponentParameterProperty
  | BasicProperty
  | CloneCountProperty;
export enum PropertyType {
  ComponentProperty,
  BasicProperty,
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
  propertyType: PropertyType.BasicProperty;
  name$: OBS<string>;
}

export interface CloneCountProperty extends PropertyBase {
  propertyType: PropertyType.CloneCountProperty;
}

export namespace CreateProperty {
  export async function componentBlank(
    ctx: MainContext,
    componentInput: ComponentParameter
  ): Promise<ComponentParameterProperty> {
    const id = `component-property-${crypto.randomUUID()}`;
    const expr = await ctx.objectFactory.createNumberExpr();
    return component(ctx, id, componentInput, expr);
  }

  export async function component(
    ctx: MainContext,
    id: string,
    componentInput: ComponentParameter,
    expr: Expr
  ): Promise<ComponentParameterProperty> {
    const itemBase = await ctx.objectFactory.createExItemBase(id);
    const componentProperty: ComponentParameterProperty = {
      ...itemBase,
      itemType: ExItemType.Property,
      expr$: createBehaviorSubjectWithLifetime(itemBase.destroy$, expr),
      propertyType: PropertyType.ComponentProperty,
      componentParameter: componentInput,
    };
    return componentProperty;
  }

  export async function basicBlank(
    ctx: MainContext,
    expr: Expr
  ): Promise<BasicProperty> {
    const id = `basic-property-${crypto.randomUUID()}`;
    const name = `Basic Property`;
    return await basic(ctx, id, name, expr);
  }

  export async function basic(
    ctx: MainContext,
    id: string,
    name: string,
    expr: Expr
  ): Promise<BasicProperty> {
    const itemBase = await ctx.objectFactory.createExItemBase(id);
    const exprSub$ = createBehaviorSubjectWithLifetime(itemBase.destroy$, expr);
    const nameSub$ = createBehaviorSubjectWithLifetime(itemBase.destroy$, name);
    const property: BasicProperty = {
      ...itemBase,
      itemType: ExItemType.Property,
      expr$: exprSub$,
      name$: nameSub$,
      propertyType: PropertyType.BasicProperty,
    };
    return property;
  }

  export async function cloneCountBlank(
    ctx: MainContext
  ): Promise<CloneCountProperty> {
    const id = `clone-count-property-${crypto.randomUUID()}`;
    const expr = await ctx.objectFactory.createNumberExpr();
    return cloneCount(ctx, id, expr);
  }

  export async function cloneCount(
    ctx: MainContext,
    id: string,
    expr: Expr
  ): Promise<CloneCountProperty> {
    const itemBase = await ctx.objectFactory.createExItemBase(id);
    const cloneCountProperty: CloneCountProperty = {
      ...itemBase,
      itemType: ExItemType.Property,
      expr$: createBehaviorSubjectWithLifetime(itemBase.destroy$, expr),
      propertyType: PropertyType.CloneCountProperty,
    };
    return cloneCountProperty;
  }
}

export namespace PropertyUtils {
  export const CLONE_COUNT_PROPERTY_NAME = "Clone Count";

  export function getName$(property: Property): OBS<string> {
    switch (property.propertyType) {
      case PropertyType.ComponentProperty:
        return ComponentParameterUtils.getName$(property.componentParameter);
      case PropertyType.BasicProperty:
        return property.name$;
      case PropertyType.CloneCountProperty:
        return of(CLONE_COUNT_PROPERTY_NAME);
    }
  }
}