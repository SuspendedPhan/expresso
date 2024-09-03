import { ProjectComponentWindowFocus } from "src/utils/focus/ProjectComponentWindowFocus";
import type { DexVariantKind } from "src/utils/utils/VariantUtils4";
import { variant, type VariantOf } from "variant";

export const Focus2 = variant({
  NotFocus2: {},
});

export type Focus2 = VariantOf<typeof Focus2> | ProjectComponentWindowFocus;
export type Focus2Kind = DexVariantKind<typeof Focus2>;