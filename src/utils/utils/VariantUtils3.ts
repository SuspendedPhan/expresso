import { typed, pass, variant, fields, type VariantOf, type Variant } from "variant";

// type Foo = {
//     Number: { id: string; value: number };
//     Call: { id: string; args: Foo[] };
//     ReferenceExpr: { id: string; targetId: string; referenceExprKind: string };
//   };
  
//   type Foo4 = {
    
//   }
  
//   type FooNumber = Record<"type", "Number"> & Foo["Number"];
  
//   type Foo2 = {
//     [K in keyof Foo]: Foo[K] & { "type": K };
//   };
  
//   const Foo3 = typed<Record<"type", Foo2>>({
//     Number: pass,
//     Call: pass,
//     ReferenceExpr: pass,
//   });
  
  const Bar = variant({
    Number: fields<{id: string}>(),
  });
  
  type Bar = VariantOf<typeof Bar>;
  
  // const Baz = {
  //   Number: { id: "1" },
  // };
  
  // type Baz0 = {
  //   Baz2: { id: string, type: "Baz2" };
  //   Baz3: { id: string, type: "Baz3", baz: Baz };
  // };
  
  type Baz2 = Variant<"Baz2", {id: string}>;
  type Baz3 = Variant<"Baz3", {id: string, baz: Baz}>;
  type Baz4 = Baz2 | Baz3;
  const Baz = variant(typed<Baz4>({
    Baz2: pass,
    Baz3: pass,
  }));
  type Baz = VariantOf<typeof Baz>;
  
  Baz.Baz3({ id: "1", baz: Baz.Baz2({ id: "2" }) });
  
  
  
  type Bay0 = {
    Bay2: { id2: string },
    Bay3: { id3: string, bay00: Bay00 },
  };
  
  type Bay0Variants = {
    [K in keyof Bay0]: Variant<K, Bay0[K]>;
  }[keyof Bay0];
  
  const Bay00 = variant(typed<Bay0Variants>({
    Bay2: pass,
    Bay3: pass,
  }));
  type Bay00 = VariantOf<typeof Bay00>;
  
  
  
  type Bay02Key = (keyof Bay0)[0];
  type Bay02 = Variant<Bay02Key, Bay0["Bay2"]>;
  type Bay03 = Variant<"Bay3", Bay0["Bay3"]>;
  type Bay04 = Bay02 | Bay03;
  const Bay05 = variant(typed<Bay04>({
    Bay2: pass,
    Bay3: pass,
  }));
  type Bay05 = VariantOf<typeof Bay05>;
  
  
  type Bay2 = Variant<"Bay2", {id: string}>;
  type Bay3 = Variant<"Bay3", {id: string, bay: Bay}>;
  type Bay4 = Bay2 | Bay3;
  const Bay = variant(typed<Bay4>({
    Bay2: pass,
    Bay3: pass,
  }));
  type Bay = VariantOf<typeof Bay>;
  
  Bay.Bay3({ id: "1", bay: Bay.Bay2({ id: "2" }) });
  
  