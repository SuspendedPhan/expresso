import { type Variant, variant, typed, pass, type VariantOf } from "variant";

// Standard example
type Bay2 = Variant<"Bay2", {id: string}>;
type Bay3 = Variant<"Bay3", {id: string, bay: Bay}>;
type Bay4 = Bay2 | Bay3;
const Bay = variant(typed<Bay4>({
  Bay2: pass,
  Bay3: pass,
}));
type Bay = VariantOf<typeof Bay>;
