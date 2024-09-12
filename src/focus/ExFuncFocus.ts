import type { ExFunc } from "src/ex-object/ExFunc";
import type { ExFuncParameter } from "src/ex-object/ExFuncParameter";
import { dexVariant, type DexVariantKind } from "src/utils/utils/VariantUtils4";
import { pass, type VariantOf } from "variant";

interface ExFuncFocus_ {
    Name: { exFunc: ExFunc, isEditing: boolean };
    Parameter: { parameter: ExFuncParameter, isEditing: boolean };
}

export const ExFuncFocusFactory = dexVariant.scoped("ExFuncFocus")(dexVariant.typed<ExFuncFocus_>({
    Name: pass,
    Parameter: pass,
}));

export type ExFuncFocus = VariantOf<typeof ExFuncFocusFactory>;
export type ExFuncFocusKind = DexVariantKind<typeof ExFuncFocusFactory>;