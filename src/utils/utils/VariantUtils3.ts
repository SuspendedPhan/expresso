import {
  pass,
  typed,
  variant,
  variantCosmos,
  type TypeNames,
  type Variant,
  type VariantModule,
  type VariantOf,
} from "variant";
import type { ExactDefinition } from "variant/lib/typed";
// --------------------------------------------
// Now let's extract the variantTyped helper.
// --------------------------------------------

/**
 * Type-first helper for creating a variant union from a record of variants.
 * @param T Variant type defintion.
 * @param Key Discriminator.
 */
type DexVariantUnion7_<T extends Record<string, any>, Key extends string> = {
  [K in keyof T]: K extends string ? Variant<K, T[K], Key> : never;
}[keyof T];

/**
 * Creates a type-first variant module.
 * @param key 
 * @param obj 
 * @returns 
 */
function dexVariantTyped7_<T extends Record<string, any>, Key extends string>(
  key: Key,
  obj: ExactDefinition<DexVariantUnion7_<T, Key>, Key>
) {
  type VUnion = DexVariantUnion7_<T, Key>;
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
type DexVariantKind<T extends VariantModule<K>, K extends string> = {
  [K in keyof T]: ReturnType<(T)[K]>;
};

// Now the declaration code:

const Bay7_Key = "type2";

type Bay7_0 = {
  Bay2: { id2: string };
  Bay3: { id3: string; bay00: Bay7_3 };
};

const Bay7_3 = dexVariantTyped7_<Bay7_0, typeof Bay7_Key>(Bay7_Key, {
  Bay2: pass,
  Bay3: pass,
});

type Bay7_3 = VariantOf<typeof Bay7_3>;
type Bay7_3Kind = DexVariantKind<typeof Bay7_3, typeof Bay7_Key>;

// Client code:
const f7_: Bay7_3Kind["Bay3"] = Bay7_3.Bay3({
  id3: "1",
  bay00: Bay7_3.Bay2({ id2: "2" }),
});
console.log(f7_);

// --------------------------------------------
// Now let's make this generic. Woot!
// --------------------------------------------

const Bay6_Key = "type2";
const Bay6_Cosmos = variantCosmos({
  key: Bay6_Key,
});

type Bay6_0 = {
  Bay2: { id2: string };
  Bay3: { id3: string; bay00: Bay6_3 };
};

type Bay6_2_Generic<T extends Record<string, any>, Key extends string> = {
  [K in keyof T]: K extends string ? Variant<K, T[K], Key> : never;
}[keyof T];

type Bay6_2 = Bay6_2_Generic<Bay6_0, typeof Bay6_Key>;

const Bay6_3 = Bay6_Cosmos.variant(
  Bay6_Cosmos.typed<Bay6_2>({
    Bay2: pass,
    Bay3: pass,
  })
);

type Bay6_3<T extends TypeNames<typeof Bay6_3> = undefined> = VariantOf<
  typeof Bay6_3,
  T
>;

type Bay6_4 = {
  [K in keyof Bay6_0]: ReturnType<(typeof Bay6_3)[K]>;
};

// Client code:
const f6_: Bay6_4["Bay3"] = Bay6_3.Bay3({
  id3: "1",
  bay00: Bay6_3.Bay2({ id2: "2" }),
});
// const f6_: Bay6_3["Bay3"] = Bay6_3.Bay3({ id3: "1", bay00: Bay6_3.Bay2({ id2: "2" }) });
console.log(f6_);

// --------------------------------------------
// Now let's try to make the helper.
// --------------------------------------------
const Bay5_Key = "type2";
const Bay5_Cosmos = variantCosmos({
  key: Bay5_Key,
});

type Bay5_0 = {
  Bay2: { id2: string };
  Bay3: { id3: string; bay00: Bay5_3 };
};

type Bay5_2 = {
  [K in keyof Bay5_0]: Variant<K, Bay5_0[K], typeof Bay5_Key>;
}[keyof Bay5_0];

const Bay5_3 = Bay5_Cosmos.variant(
  Bay5_Cosmos.typed<Bay5_2>({
    Bay2: pass,
    Bay3: pass,
  })
);
// type Bay5_3 = VariantOf<typeof Bay5_3>;
type Bay5_3<T extends TypeNames<typeof Bay5_3> = undefined> = VariantOf<
  typeof Bay5_3,
  T
>;

type Bay5_4 = {
  [K in keyof Bay5_0]: ReturnType<(typeof Bay5_3)[K]>;
};

// Example:

const f5_: ReturnType<typeof Bay5_3.Bay3> = Bay5_3.Bay3({
  id3: "1",
  bay00: Bay5_3.Bay2({ id2: "2" }),
});
const f5_3: Bay5_4["Bay3"] = Bay5_3.Bay3({
  id3: "1",
  bay00: Bay5_3.Bay2({ id2: "2" }),
});

// --------------------------------------------
// Now let's try it with a helper for specific types. First, help ChatGPT understand the types.
// --------------------------------------------
const Bay4_Key = "type2";
const Bay4_Cosmos = variantCosmos({
  key: Bay4_Key,
});

type Bay4_0 = {
  Bay2: { id2: string };
  Bay3: { id3: string; bay00: Bay4_3 };
};

type Bay4_2 = {
  [K in keyof Bay4_0]: Variant<K, Bay4_0[K], typeof Bay4_Key>;
}[keyof Bay4_0];

const Bay4_3 = Bay4_Cosmos.variant(
  Bay4_Cosmos.typed<Bay4_2>({
    Bay2: pass,
    Bay3: pass,
  })
);
// type Bay4_3 = VariantOf<typeof Bay4_3>;
type Bay4_3<T extends TypeNames<typeof Bay4_3> = undefined> = VariantOf<
  typeof Bay4_3,
  T
>;

type Bay4_Bay2 = ReturnType<typeof Bay4_3.Bay2>;
type Bay4_Bay3 = ReturnType<typeof Bay4_3.Bay3>;

// Example:
Bay4_3.Bay3({ id3: "1", bay00: Bay4_3.Bay2({ id2: "2" }) });
const f: ReturnType<typeof Bay4_3.Bay3> = Bay4_3.Bay3({
  id3: "1",
  bay00: Bay4_3.Bay2({ id2: "2" }),
});
const f2: Bay4_3<"Bay3"> = Bay4_3.Bay2({ id2: "2" });
const f3: Bay4_Bay2 = Bay4_3.Bay2({ id2: "2" });

// --------------------------------------------
// Now let's try it with generic
// --------------------------------------------
const Bay3_Key = "type2";
const Bay3_Cosmos = variantCosmos({
  key: Bay3_Key,
});

type Bay3_0 = {
  Bay2: { id2: string };
  Bay3: { id3: string; bay00: Bay3_3 };
};

type Bay3_2 = {
  [K in keyof Bay3_0]: Variant<K, Bay3_0[K], typeof Bay3_Key>;
}[keyof Bay3_0];

const Bay3_3 = Bay3_Cosmos.variant(
  Bay3_Cosmos.typed<Bay3_2>({
    Bay2: pass,
    Bay3: pass,
  })
);
// type Bay3_3 = VariantOf<typeof Bay3_3>;
type Bay3_3<T extends TypeNames<typeof Bay3_3> = undefined> = VariantOf<
  typeof Bay3_3,
  T
>;

// Example:
Bay3_3.Bay3({ id3: "1", bay00: Bay3_3.Bay2({ id2: "2" }) });
const f: ReturnType<typeof Bay3_3.Bay3> = Bay3_3.Bay3({
  id3: "1",
  bay00: Bay3_3.Bay2({ id2: "2" }),
});
const f2: Bay3_3<"Bay3"> = Bay3_3.Bay2({ id2: "2" });

// --------------------------------------------
// Now let's try it with a const key
// --------------------------------------------
const Bay2_Key = "type2";
const Bay2_Cosmos = variantCosmos({
  key: Bay2_Key,
});

type Bay2_0 = {
  Bay2: { id2: string };
  Bay3: { id3: string; bay00: Bay2_3 };
};

type Bay2_2 = {
  [K in keyof Bay2_0]: Variant<K, Bay2_0[K], typeof Bay2_Key>;
}[keyof Bay2_0];

const Bay2_3 = Bay2_Cosmos.variant(
  Bay2_Cosmos.typed<Bay2_2>({
    Bay2: pass,
    Bay3: pass,
  })
);
type Bay2_3 = VariantOf<typeof Bay2_3>;

// Example:
Bay2_3.Bay3({ id3: "1", bay00: Bay2_3.Bay2({ id2: "2" }) });

// --------------------------------------------
// Now let's try it with cosmos
// --------------------------------------------
const Bay1_Cosmos = variantCosmos({
  key: "type2",
});

type Bay1_0 = {
  Bay2: { id2: string };
  Bay3: { id3: string; bay00: Bay1_3 };
};

type Bay1_2 = {
  [K in keyof Bay1_0]: Variant<K, Bay1_0[K], "type2">;
}[keyof Bay1_0];

const Bay1_3 = Bay1_Cosmos.variant(
  Bay1_Cosmos.typed<Bay1_2>({
    Bay2: pass,
    Bay3: pass,
  })
);
type Bay1_3 = VariantOf<typeof Bay1_3>;

// Example:
Bay1_3.Bay3({ id3: "1", bay00: Bay1_3.Bay2({ id2: "2" }) });

// --------------------------------------------
// This one is good cause rename works. Rename the variant() first, then the type.
// --------------------------------------------

type Bay0_ = {
  Bay2: { id2: string };
  Bay3: { id3: string; bay00: Bay00 };
};

type Bay0Variants = {
  [K in keyof Bay0_]: Variant<K, Bay0_[K]>;
}[keyof Bay0_];

const Bay00 = variant(
  typed<Bay0Variants>({
    Bay2: pass,
    Bay3: pass,
  })
);
type Bay00 = VariantOf<typeof Bay00>;

// Example:
Bay00.Bay3({ id3: "1", bay00: Bay00.Bay2({ id2: "2" }) });

// --------------------------------------------

type Bay0 = {
  Bay2: { id2: string };
  Bay3: { id3: string; bay00: Bay00 };
};
type Bay02Key = (keyof Bay0)[0];
type Bay02 = Variant<Bay02Key, Bay0["Bay2"]>;
type Bay03 = Variant<"Bay3", Bay0["Bay3"]>;
type Bay04 = Bay02 | Bay03;
const Bay05 = variant(
  typed<Bay04>({
    Bay2: pass,
    Bay3: pass,
  })
);
type Bay05 = VariantOf<typeof Bay05>;

// --------------------------------------------

type Bay2 = Variant<"Bay2", { id: string }>;
type Bay3 = Variant<"Bay3", { id: string; bay: Bay }>;
type Bay4 = Bay2 | Bay3;
const Bay = variant(
  typed<Bay4>({
    Bay2: pass,
    Bay3: pass,
  })
);
type Bay = VariantOf<typeof Bay>;

Bay.Bay3({ id: "1", bay: Bay.Bay2({ id: "2" }) });
