import { type Variant, variantCosmos, type VariantModule } from "variant";
import type { ExactDefinition } from "variant/lib/typed";

/**
 * Type-first helper for creating a variant union from a record of variants.
 * @param T Variant type defintion.
 * @param Key Discriminator.
 */
export type DexVariantUnion<T extends Record<string, any>, Key extends string = "type"> = {
  [K in keyof T]: K extends string ? Variant<K, T[K], Key> : never;
}[keyof T];

/**
 * Creates a type-first variant module.
 * @param key
 * @param obj
 * @returns
 */
export function dexVariantTyped<T extends Record<string, any>, Key extends string>(
  key: Key,
  obj: ExactDefinition<DexVariantUnion<T, Key>, Key>
) {
  type VUnion = DexVariantUnion<T, Key>;
  const cosmos = variantCosmos({ key });
  return cosmos.variant(cosmos.typed<VUnion>(obj));
}

/**
 * Given:
 *   The desired Expr definition is: { Number: {}, Call: {} }`;
 *   const Expr = variant(...);
 *   type ExprKind = DexVariant<...>;
 * Then:
 *   const expr: ExprKind["Number"] = Expr.Number();
 */
export type DexVariantKind<T extends VariantModule<K>, K extends string = "type"> = {
  [K in keyof T]: ReturnType<T[K]>;
};
