import type { VariantModule } from "variant";

export type DexTypeMap<
  T extends VariantModule<Key>,
  Key extends string = "type"
> = {
  [P in keyof T]: T[P]["output"]["type"];
};

export type DexTypesOf<
  T extends VariantModule<Key>,
  Key extends string = "type"
> = DexTypeMap<T, Key>[keyof T];

export type DexTypeNames<
  T extends VariantModule<Key>,
  Key extends string = "type"
> = DexTypesOf<T, Key> | undefined;