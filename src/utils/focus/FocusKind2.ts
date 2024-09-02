import { ProjectComponentWindowFocus } from "src/utils/focus/ProjectComponentWindowFocus";
import type { DexVariantKind } from "src/utils/utils/VariantUtils4";
import { payload, variantCosmos, type VariantOf } from "variant";

export const FOCUS2_TAG = "focus2Kind";
export const Focus2Cosmos = variantCosmos({
  key: FOCUS2_TAG,
});

export const Focus2 = Focus2Cosmos.variant({
    ProjectComponentWindowFocus: payload<ProjectComponentWindowFocus>(),
});

export type Focus2 = VariantOf<typeof Focus2>;
export type Focus2Kind = DexVariantKind<typeof Focus2, typeof FOCUS2_TAG>;