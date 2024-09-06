/**
 * Component Property
 * Object Property
 * Component Parameter
 * Component Argument
 */

import { Effect } from "effect";
import { of } from "rxjs";
import {} from "src/ex-object/Component";
import { ComponentParameter } from "src/ex-object/ComponentParameter";
import { ExItem, type ExItemBase } from "src/ex-object/ExItem";
import { ExprFactory, ExprFactory2, type Expr } from "src/ex-object/Expr";
import type MainContext from "src/main-context/MainContext";
import { log5 } from "src/utils/utils/Log5";
import {
  createBehaviorSubjectWithLifetime,
  type OBS,
  type SUB,
} from "src/utils/utils/Utils";
import {
  dexScopedVariant,
  type DexVariantKind,
} from "src/utils/utils/VariantUtils4";
import { fields, matcher, type VariantOf } from "variant";

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

export const PropertyFactory = dexScopedVariant("Property", {
  ComponentParameterProperty: fields<ComponentParameterProperty>(),
  BasicProperty: fields<BasicProperty>(),
  CloneCountProperty: fields<CloneCountProperty>(),
});

export type Property = VariantOf<typeof PropertyFactory>;
export type PropertyKind = DexVariantKind<typeof PropertyFactory>;

export const PropertyFactory2 = {
  async ComponentParameterProperty(
    ctx: MainContext,
    createArgs: CreatePropertyArgs["ComponentParameter"]
  ) {
    const createArgs2: Required<CreatePropertyArgs["ComponentParameter"]> = {
      id: createArgs.id ?? "component-parameter-" + crypto.randomUUID(),
      componentParameter: createArgs.componentParameter,
      expr: createArgs.expr ?? (await ctx.objectFactory.createNumberExpr()),
    };

    const base = await ExItem.createExItemBase(createArgs2.id);
    const property = PropertyFactory.ComponentParameterProperty({
      ...base,
      expr$: createBehaviorSubjectWithLifetime(base.destroy$, createArgs2.expr),
      componentParameter: createArgs2.componentParameter,
    });
    return property;
  },

  BasicProperty(createArgs: CreatePropertyArgs["Basic"]) {
    return Effect.gen(function* () {
      const createArgs2: Required<CreatePropertyArgs["Basic"]> = {
        id: createArgs.id ?? "basic-property-" + crypto.randomUUID(),
        expr: createArgs.expr === undefined ? yield* ExprFactory2.Number({}) : createArgs.expr,
        name: createArgs.name ?? "Basic Property",
      };

      const base = await ExItem.createExItemBase(createArgs2.id);
      return PropertyFactory.BasicProperty({
        ...base,
        expr$: createBehaviorSubjectWithLifetime(
          base.destroy$,
          createArgs2.expr
        ),
        name$: createBehaviorSubjectWithLifetime(
          base.destroy$,
          createArgs2.name
        ),
      });
    });
  },

  async CloneCountProperty(
    ctx: MainContext,
    createArgs: CreatePropertyArgs["CloneCount"]
  ) {
    const createArgs2: Required<CreatePropertyArgs["CloneCount"]> = {
      id: createArgs.id ?? "clone-count-property-" + crypto.randomUUID(),
      expr: createArgs.expr ?? (await ctx.objectFactory.createNumberExpr(1)),
    };

    const base = await ExItem.createExItemBase(createArgs2.id);
    return PropertyFactory.CloneCountProperty({
      ...base,
      expr$: createBehaviorSubjectWithLifetime(base.destroy$, createArgs2.expr),
    });
  },
};

export namespace PropertyFns {
  export const CLONE_COUNT_PROPERTY_NAME = "Clone Count";

  export function getName$(property: Property): OBS<string> {
    return matcher(property)
      .when(PropertyFactory.ComponentParameterProperty, (p) =>
        ComponentParameter.getName$(p.componentParameter)
      )
      .when(PropertyFactory.BasicProperty, (p) => p.name$)
      .when(PropertyFactory.CloneCountProperty, () =>
        of(CLONE_COUNT_PROPERTY_NAME)
      )
      .complete();
  }
}
