import {
  descope,
  match,
  matcher,
  scoped,
  variant,
  type Variant,
  variantCosmos,
  type VariantModule,
} from "variant";
import type { RawVariant, VariantOf } from "variant/lib/precepts";
import { pass, typedImpl, type ExactDefinition } from "variant/lib/typed";
import { variantImpl } from "variant/lib/variant";

/**
 * Type-first helper for creating a variant union from a record of variants.
 * @param T Variant type defintion.
 * @param Key Discriminator.
 */
export type DexVariantUnion<
  T extends Record<string, any>,
  Key extends string = "type"
> = {
  [K in keyof T]: K extends string ? Variant<K, T[K], Key> : never;
}[keyof T];

/**
 * Creates a type-first variant module.
 * @param key
 * @param obj
 * @returns
 */
export const dexVariantTyped = dexVariantImpl("type").variantTyped;

/**
 * Creates a scoped, type-first variant module.
 */
export const dexVariantScopedTyped = dexVariantImpl("type").variantScopedTyped;

export function dexVariantImpl<Key extends string>(key: Key) {
  return {
    variantTyped<T extends Record<string, any>>(
      obj: ExactDefinition<DexVariantUnion<T, Key>, Key>
    ) {
      const t = this.typed<T>(obj);
      return variantImpl(key).variant(t);
    },

    typed<T extends Record<string, any>>(
      obj: ExactDefinition<DexVariantUnion<T, Key>, Key>
    ) {
      type VUnion = DexVariantUnion<T, Key>;
      return typedImpl(key).typed<VUnion>(obj);
    },

    scopedTyped<T extends Record<string, any>, Scope extends string>(
      scope: Scope,
      obj: ExactDefinition<DexVariantUnion<T, Key>, Key>
    ) {
      const t = this.typed<T>(obj);
      return variantImpl(key).scoped(scope, t);
    },

    variantScopedTyped<T extends Record<string, any>, Scope extends string>(
      scope: Scope,
      obj: ExactDefinition<DexVariantUnion<T, Key>, Key>
    ) {
      const s = this.scopedTyped<T, Scope>(scope, obj);
      return variantImpl(key).variant(s);
    },

    /**
     * Curried version of `scoped`.
     * 
     * Here's a type-first example:
     * ```
     * interface Bar {
     *   Var1: { a: number };
     *   Var2: { b: string };
     * }
     *
     * const Bar2 = dexVariant.scoped("Bar")(dexVariant.typed<Bar>({
     *   Var1: pass,
     *   Var2: pass,
     * }));
     * ```
     */
    scoped<Scope extends string>(scope: Scope) {
      return function <T extends Record<string, any>>(v: T) {
        return scoped<T, Scope>(scope, v);
      };
    },
  };
}

export const dexVariant = dexVariantImpl("type");

/**
 * Given:
 *   The desired Expr definition is: { Number: {}, Call: {} }`;
 *   const Expr = variant(...);
 *   type ExprKind = DexVariant<...>;
 * Then:
 *   const expr: ExprKind["Number"] = Expr.Number();
 */
export type DexVariantKind<
  T extends VariantModule<K>,
  K extends string = "type"
> = {
  [K in keyof T]: Awaited<ReturnType<T[K]>>;
};

export type DexVariantFactoryArgs<T extends (...args: any[]) => any> =
  Parameters<T>[0];

export function dexScopedVariant<T extends RawVariant, Scope extends string>(
  scope: Scope,
  v: T
) {
  return variant(scoped<T, Scope>(scope, v));
}
