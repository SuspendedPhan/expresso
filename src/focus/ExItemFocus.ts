import type { ExItem } from "src/ex-object/ExItem";
import { dexVariant, type DexVariantKind } from "src/utils/utils/VariantUtils4";
import { pass, type VariantOf } from "variant";

interface ExItemFocus_ {
    NewCommand: { exItem: ExItem };
}

export const ExItemFocusFactory = dexVariant.scoped("ExItemFocus")(dexVariant.typed<ExItemFocus_>({
    NewCommand: pass,
}));

export type ExItemFocus = VariantOf<typeof ExItemFocusFactory>;
export type ExItemFocusKind = DexVariantKind<typeof ExItemFocusFactory>;