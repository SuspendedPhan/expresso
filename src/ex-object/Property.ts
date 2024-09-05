/**
 * Component Property
 * Object Property
 * Component Parameter
 * Component Argument
 */

import assert from "assert-ts";
import { firstValueFrom, of } from "rxjs";
import {
  ComponentParameterFns,
  type ComponentParameterFactory,
  type CustomComponent
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

interface ComponentParameterProperty extends PropertyBase {
  componentParameter: ComponentParameter;
}

interface BasicProperty extends PropertyBase {
  name$: SUB<string>;
}

interface CloneCountProperty extends PropertyBase {}

export interface CreatePropertyArgs {
  Base: {
    id?: string;
    expr?: Expr;
  };

  ComponentParameter: {
    componentParameter: ComponentParameter;
  } & CreatePropertyArgs["Base"];

  Basic: {
    name?: string;
  } & CreatePropertyArgs["Base"];

  CloneCount: {} & CreatePropertyArgs["Base"];
}

export const Property = {
  creators: variant({
    ComponentParameterProperty: fields<ComponentParameterProperty>(),
    BasicProperty: fields<BasicProperty>(),
    CloneCountProperty: fields<CloneCountProperty>(),
  }),

  creators2: {
    async ComponentParameterProperty(ctx: MainContext, createArgs: CreatePropertyArgs["ComponentParameter"]) {
      const createArgs2: Required<CreatePropertyArgs["ComponentParameter"]> = {
        id: createArgs.id ?? "component-parameter-" + crypto.randomUUID(),
        componentParameter: createArgs.componentParameter,
        expr: createArgs.expr ?? (await ctx.objectFactory.createNumberExpr()),
      };

      const base = await ctx.objectFactory.createExItemBase(createArgs2.id);
      const property = Property.creators.ComponentParameterProperty({
        ...base,
        expr$: createBehaviorSubjectWithLifetime(base.destroy$, createArgs2.expr),
        componentParameter: createArgs2.componentParameter,
      });
      return property;
    },

    async BasicProperty(ctx: MainContext, createArgs: CreatePropertyArgs["Basic"]) {
      const createArgs2: Required<CreatePropertyArgs["Basic"]> = {
        id: createArgs.id ?? "basic-property-" + crypto.randomUUID(),
        expr: createArgs.expr ?? (await ctx.objectFactory.createNumberExpr()),
        name: createArgs.name ?? "Basic Property",
      };

      const base = await ctx.objectFactory.createExItemBase(createArgs2.id);
      return Property.creators.BasicProperty({
        ...base,
        expr$: createBehaviorSubjectWithLifetime(base.destroy$, createArgs2.expr),
        name$: createBehaviorSubjectWithLifetime(base.destroy$, createArgs2.name),
      });
    },

    async CloneCountProperty(ctx: MainContext, createArgs: CreatePropertyArgs["CloneCount"]) {
      const createArgs2: Required<CreatePropertyArgs["CloneCount"]> = {
        id: createArgs.id ?? "clone-count-property-" + crypto.randomUUID(),
        expr: createArgs.expr ?? (await ctx.objectFactory.createNumberExpr(1)),
      };

      const base = await ctx.objectFactory.createExItemBase(createArgs2.id);
      return Property.creators.CloneCountProperty({
        ...base,
        expr$: createBehaviorSubjectWithLifetime(base.destroy$, createArgs2.expr),
      });
    },
  }
}

export type Property = VariantOf<typeof Property.creators>;
export type PropertyKind = DexVariantKind<typeof Property.creators>;

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
