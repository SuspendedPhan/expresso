/**
 * Component Property
 * Object Property
 * Component Parameter
 * Component Argument
 */

import assert from "assert-ts";
import { firstValueFrom, of } from "rxjs";
import {
  ComponentKind,
  ComponentParameterFns,
  type ComponentParameter,
  type CustomComponent,
} from "src/ex-object/Component";
import {
  ExItemFn,
  ExItemType,
  type ExItem,
  type ExItemBase,
  type Expr,
} from "src/ex-object/ExItem";
import type { ExObject } from "src/ex-object/ExObject";
import type MainContext from "src/main-context/MainContext";
import { log5 } from "src/utils/utils/Log5";
import {
  createBehaviorSubjectWithLifetime,
  type OBS,
  type SUB,
} from "src/utils/utils/Utils";
import type { DexVariantKind } from "src/utils/utils/VariantUtils4";
import { fields, matcher, variant, type VariantOf } from "variant";

const log55 = log5("Property.ts");

interface PropertyBase extends ExItemBase {
  expr$: SUB<Expr>;
}

export const Property = variant({
  ComponentParameterProperty: fields<
    {
      componentParameter: ComponentParameter;
    } & PropertyBase
  >(),

  BasicProperty: fields<
    {
      name$: SUB<string>;
      expr$: SUB<Expr>;
      base: ExItemBase;
    } & PropertyBase
  >(),

  CloneCountProperty: fields<
    {
      expr$: SUB<Expr>;
      base: ExItemBase;
    } & PropertyBase
  >(),
});

export type Property = VariantOf<typeof Property>;
export type PropertyKind = DexVariantKind<typeof Property>;

export namespace CreateProperty {
  export async function componentBlank(
    ctx: MainContext,
    componentInput: ComponentParameter
  ): Promise<PropertyKind["ComponentParameterProperty"]> {
    const id = `component-property-${crypto.randomUUID()}`;
    const expr = await ctx.objectFactory.createNumberExpr();
    return component(ctx, id, componentInput, expr);
  }

  export async function component(
    ctx: MainContext,
    id: string,
    componentInput: ComponentParameter,
    expr: Expr
  ): Promise<PropertyKind["ComponentParameterProperty"]> {
    const itemBase = await ctx.objectFactory.createExItemBase(id);
    log55.debug(`CreateProperty.component.itemBase.end ${id}`);

    const componentProperty: PropertyKind["ComponentParameterProperty"] = {
      ...itemBase,
      itemType: ExItemType.Property,
      expr$: createBehaviorSubjectWithLifetime(itemBase.destroy$, expr),
      propertyType: PropertyType.ComponentProperty,
      componentParameter: componentInput,
    };
    expr.parent$.next(componentProperty);
    ctx.eventBus.propertyAdded$.next(componentProperty);

    log55.debug(`CreateProperty.component.end`);
    return componentProperty;
  }

  export async function basicBlank(
    ctx: MainContext
  ): Promise<PropertyKind["BasicProperty"]> {
    const id = `basic-property-${crypto.randomUUID()}`;
    const expr = await ctx.objectFactory.createNumberExpr();
    const name = `Basic Property`;
    return await basic(ctx, id, name, expr);
  }

  export async function basic(
    ctx: MainContext,
    id: string,
    name: string,
    expr: Expr
  ): Promise<PropertyKind["BasicProperty"]> {
    const itemBase = await ctx.objectFactory.createExItemBase(id);
    const exprSub$ = createBehaviorSubjectWithLifetime(itemBase.destroy$, expr);
    const nameSub$ = createBehaviorSubjectWithLifetime(itemBase.destroy$, name);
    const property: PropertyKind["BasicProperty"] = {
      ...itemBase,
      itemType: ExItemType.Property,
      expr$: exprSub$,
      name$: nameSub$,
      propertyType: PropertyType.PropertyKind["BasicProperty"],
    };
    expr.parent$.next(property);
    ctx.eventBus.propertyAdded$.next(property);
    return property;
  }

  export async function cloneCountBlank(
    ctx: MainContext
  ): Promise<PropertyKind["CloneCountProperty"]> {
    const id = `clone-count-property-${crypto.randomUUID()}`;
    const expr = await ctx.objectFactory.createNumberExpr(1);
    return cloneCount(ctx, id, expr);
  }

  export async function cloneCount(
    ctx: MainContext,
    id: string,
    expr: Expr
  ): Promise<PropertyKind["CloneCountProperty"]> {
    const itemBase = await ctx.objectFactory.createExItemBase(id);
    const cloneCountProperty: PropertyKind["CloneCountProperty"] = {
      ...itemBase,
      itemType: ExItemType.Property,
      expr$: createBehaviorSubjectWithLifetime(itemBase.destroy$, expr),
      propertyType: PropertyType.CloneCountProperty,
    };
    expr.parent$.next(cloneCountProperty);
    ctx.eventBus.propertyAdded$.next(cloneCountProperty);
    log55.debug(`CreateProperty.cloneCount.end`);
    return cloneCountProperty;
  }
}

export namespace PropertyFns {
  export const CLONE_COUNT_PROPERTY_NAME = "Clone Count";

  export function getName$(property: Property): OBS<string> {
    return matcher(property)
      .when(Property.ComponentParameterProperty, (p) =>
        ComponentParameterFns.getName$(p.componentParameter)
      )
      .when(Property.BasicProperty, (p) => p.name$)
      .when(Property.CloneCountProperty, () => of(CLONE_COUNT_PROPERTY_NAME))
      .complete();
  }

  export async function* getAncestorPropertyGen(
    exItem: ExItem
  ): AsyncGenerator<[Property, ExObject | CustomComponent], void, undefined> {
    for await (const ancestor of ExItemFn.getAncestors(exItem)) {
      log55.debug("ancestor", ancestor.id);

      switch (ancestor.itemType) {
        case ExItemType.ExObject:
          yield [ancestor.cloneCountProperty, ancestor];
          for (const property of ancestor.componentParameterProperties) {
            yield [property, ancestor];
          }
          for (const property of await firstValueFrom(
            ancestor.basicProperties$
          )) {
            yield [property, ancestor];
          }
          break;
        case ExItemType.Component:
          assert(ancestor.componentKind === ComponentKind.CustomComponent);
          for (const property of await firstValueFrom(ancestor.properties$)) {
            yield [property, ancestor];
          }
          break;
      }
    }
  }
}
