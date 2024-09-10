import type { ExFunc } from "src/ex-object/ExFunc";
import { dexVariant, type DexVariantKind } from "src/utils/utils/VariantUtils4";
import { pass, type VariantOf } from "variant";

interface ExFuncFocus_ {
    Name: { exFunc: ExFunc };
    Parameter: { exFunc: ExFunc };
}

export const ExFuncFocusFactory = dexVariant.scoped("ExFuncFocus")(dexVariant.typed<ExFuncFocus_>({
    Name: pass,
    Parameter: pass,
}));

export type ExFuncFocus = VariantOf<typeof ExFuncFocusFactory>;
export type ExFuncFocusKind = DexVariantKind<typeof ExFuncFocusFactory>;