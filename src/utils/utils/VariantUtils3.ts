import {
  pass,
  typed,
  variant,
  variantCosmos,
  type TypeNames,
  type Variant,
  type VariantOf,
} from "variant";

// --------------------------------------------
// Now let's try to make the helper.
// --------------------------------------------
const BayKey5_ = "type2";
const BayCosmos5_ = variantCosmos({
  key: BayKey5_,
});

type Bay5_0 = {
  Bay2: { id2: string };
  Bay3: { id3: string; bay00: Bay5_3 };
};

type Bay5_2 = {
  [K in keyof Bay5_0]: Variant<K, Bay5_0[K], typeof BayKey5_>;
}[keyof Bay5_0];

const Bay5_3 = BayCosmos5_.variant(
  BayCosmos5_.typed<Bay5_2>({
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
} & {};

// Example:
Bay5_3.Bay3({ id3: "1", bay00: Bay5_3.Bay2({ id2: "2" }) });
const f: ReturnType<typeof Bay5_3.Bay3> = Bay5_3.Bay3({
  id3: "1",
  bay00: Bay5_3.Bay2({ id2: "2" }),
});
const f2: Bay5_3<"Bay3"> = Bay5_3.Bay2({ id2: "2" });
const f3: Bay5_4["Bay2"] = Bay5_3.Bay2({ id2: "2" });
// const f4: Bay5_4.

// --------------------------------------------
// Now let's try it with a helper for specific types. First, help ChatGPT understand the types.
// --------------------------------------------
const BayKey4_ = "type2";
const BayCosmos4_ = variantCosmos({
  key: BayKey4_,
});

type Bay4_0 = {
  Bay2: { id2: string };
  Bay3: { id3: string; bay00: Bay4_3 };
};

type Bay4_2 = {
  [K in keyof Bay4_0]: Variant<K, Bay4_0[K], typeof BayKey4_>;
}[keyof Bay4_0];

const Bay4_3 = BayCosmos4_.variant(
  BayCosmos4_.typed<Bay4_2>({
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
const BayKey3_ = "type2";
const BayCosmos3_ = variantCosmos({
  key: BayKey3_,
});

type Bay3_0 = {
  Bay2: { id2: string };
  Bay3: { id3: string; bay00: Bay3_3 };
};

type Bay3_2 = {
  [K in keyof Bay3_0]: Variant<K, Bay3_0[K], typeof BayKey3_>;
}[keyof Bay3_0];

const Bay3_3 = BayCosmos3_.variant(
  BayCosmos3_.typed<Bay3_2>({
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
const BayKey2_ = "type2";
const BayCosmos2_ = variantCosmos({
  key: BayKey2_,
});

type Bay2_0 = {
  Bay2: { id2: string };
  Bay3: { id3: string; bay00: Bay2_3 };
};

type Bay2_2 = {
  [K in keyof Bay2_0]: Variant<K, Bay2_0[K], typeof BayKey2_>;
}[keyof Bay2_0];

const Bay2_3 = BayCosmos2_.variant(
  BayCosmos2_.typed<Bay2_2>({
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
const BayCosmos1 = variantCosmos({
  key: "type2",
});

type Bay1_0 = {
  Bay2: { id2: string };
  Bay3: { id3: string; bay00: Bay1_3 };
};

type Bay1_2 = {
  [K in keyof Bay1_0]: Variant<K, Bay1_0[K], "type2">;
}[keyof Bay1_0];

const Bay1_3 = BayCosmos1.variant(
  BayCosmos1.typed<Bay1_2>({
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
