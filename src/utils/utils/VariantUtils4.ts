import { type Variant, variant, typed, pass, type VariantOf } from "variant";

type Bay6_2_Generic<T extends Record<string, any>, Key extends string> = {
    [K in keyof T]: K extends string ? Variant<K, T[K], Key> : never;
  }[keyof T];