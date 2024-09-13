/**
 * Component Property
 * Object Property
 * Component Parameter
 * Component Argument
 */

import assert from "assert-ts";
import { Effect } from "effect";
import { firstValueFrom, of } from "rxjs";
import { PropertyCtx } from "src/ctx/PropertyCtx";
import {} from "src/ex-object/Component";
import { ComponentParameter } from "src/ex-object/ComponentParameter";
import { ExItem, type ExItemBase } from "src/ex-object/ExItem";
import { ExObject, ExObjectFactory } from "src/ex-object/ExObject";
import { ExprFactory2, type Expr } from "src/ex-object/Expr";
import {
  createBehaviorSubjectWithLifetime,
  type OBS,
  type SUB,
} from "src/utils/utils/Utils";
import {
  dexScopedVariant,
  type DexVariantKind,
} from "src/utils/utils/VariantUtils4";
import { fields, isType, matcher, type VariantOf } from "variant";

// const log55 = log5("Property.ts");

interface PropertyBase extends ExItemBase {
  expr$: SUB<Expr>;
}

interface ComponentParameterProperty extends PropertyBase {
  componentParameter: ComponentParameter|null;
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
    parameter?: ComponentParameter | null;
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
  ComponentParameterProperty(
    createArgs: CreatePropertyArgs["ComponentParameter"]
  ) {
    return Effect.gen(function* () {
      const propertyCtx = yield* PropertyCtx;
      const createArgs2: Required<CreatePropertyArgs["ComponentParameter"]> = {
        id: createArgs.id ?? "component-parameter-" + crypto.randomUUID(),
        parameter: createArgs.parameter ?? null,
        expr: createArgs.expr ?? (yield* ExprFactory2.Number({})),
      };

      const base = yield* ExItem.createExItemBase(createArgs2.id);
      const property = PropertyFactory.ComponentParameterProperty({
        ...base,
        expr$: createBehaviorSubjectWithLifetime(
          base.destroy$,
          createArgs2.expr
        ),
        componentParameter: createArgs2.parameter,
      });
      createArgs2.expr.parent$.next(property);
      propertyCtx.properties.push(property);
      return property;
    });
  },

  BasicProperty(createArgs: CreatePropertyArgs["Basic"]) {
    return Effect.gen(function* () {
      const propertyCtx = yield* PropertyCtx;
      const createArgs2: Required<CreatePropertyArgs["Basic"]> = {
        id: createArgs.id ?? "basic-property-" + crypto.randomUUID(),
        expr:
          createArgs.expr === undefined
            ? yield* ExprFactory2.Number({})
            : createArgs.expr,
        name: createArgs.name ?? "Basic Property",
      };

      const base = yield* ExItem.createExItemBase(createArgs2.id);
      const property = PropertyFactory.BasicProperty({
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
      createArgs2.expr.parent$.next(property);
      propertyCtx.properties.push(property);
      return property;
    });
  },

  CloneCountProperty(createArgs: CreatePropertyArgs["CloneCount"]) {
    return Effect.gen(function* () {
      const propertyCtx = yield* PropertyCtx;
      const createArgs2: Required<CreatePropertyArgs["CloneCount"]> = {
        id: createArgs.id ?? "clone-count-property-" + crypto.randomUUID(),
        expr: createArgs.expr ?? (yield* ExprFactory2.Number({})),
      };

      const base = yield* ExItem.createExItemBase(createArgs2.id);
      const property = PropertyFactory.CloneCountProperty({
        ...base,
        expr$: createBehaviorSubjectWithLifetime(
          base.destroy$,
          createArgs2.expr
        ),
      });
      createArgs2.expr.parent$.next(property);
      propertyCtx.properties.push(property);
      return property;
    });
  },
};

export const Property = {
  CloneCountPropertyName: "Clone Count",

  Methods: (property: Property) => ({
    getName$(): OBS<string> {
      return matcher(property)
        .when(PropertyFactory.ComponentParameterProperty, (p) =>
          ComponentParameter.getName$(p.componentParameter)
        )
        .when(PropertyFactory.BasicProperty, (p) => p.name$)
        .when(PropertyFactory.CloneCountProperty, () =>
          of(Property.CloneCountPropertyName)
        )
        .complete();
    },

    async getNextProperty() {
      const exObject = await firstValueFrom(property.parent$);
      assert(exObject !== null && isType(exObject, ExObjectFactory));
      let found = false;
      for (const p of ExObject.Methods(exObject).properties) {
        if (found) {
          return p;
        }
        if (p === property) {
          found = true;
        }
      }
      return null;
    },

    async prevProperty() {
      const exObject = await firstValueFrom(property.parent$);
      assert(exObject !== null && isType(exObject, ExObjectFactory));
      let prev = null;
      for (const p of ExObject.Methods(exObject).properties) {
        if (p === property) {
          return prev;
        }
        prev = p;
      }
      return null;
    },
  }),
};
