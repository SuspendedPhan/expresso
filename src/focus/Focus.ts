import type { ComponentFocus } from "src/focus/ComponentFocus";
import type { EditorFocus } from "src/focus/EditorFocus";
import type { ExFuncFocus } from "src/focus/ExFuncFocus";
import type { ExItemFocus } from "src/focus/ExItemFocus";
import type { ExObjectFocus } from "src/focus/ExObjectFocus";
import type { NavFocus, NavProjectNameFocus } from "src/focus/NavFocus";
import type { ProjectComponentWindowFocus } from "src/focus/ProjectComponentWindowFocus";
import { dexVariant, type DexVariantKind } from "src/utils/utils/VariantUtils4";
import { pass, type VariantOf } from "variant";

interface Focus_ {
  None: {};
}

export const FocusFactory = dexVariant.scoped("Focus")(
  dexVariant.typed<Focus_>({
    None: pass,
  })
);

export type FocusKind = DexVariantKind<typeof FocusFactory>;

export type Focus =
  | VariantOf<typeof FocusFactory>
  | ExItemFocus
  | ExObjectFocus
  | NavFocus
  | ProjectComponentWindowFocus
  | EditorFocus
  | ComponentFocus
  | ExFuncFocus
  | NavProjectNameFocus;

export type EditingFocus = Focus & { isEditing: boolean };
