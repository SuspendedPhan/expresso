import type { ComponentFocus } from "src/utils/focus/ComponentFocus";
import type { EditorFocus } from "src/utils/focus/EditorFocus";
import type { ExItemFocus } from "src/utils/focus/ExItemFocus";
import type { ExObjectFocus } from "src/utils/focus/ExObjectFocus";
import type { ExprFocus } from "src/utils/focus/ExprFocus";
import type { NavFocus } from "src/utils/focus/NavFocus";
import type { ProjectComponentWindowFocus } from "src/utils/focus/ProjectComponentWindowFocus";
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
  | ExprFocus
  | NavFocus
  | ProjectComponentWindowFocus
  | EditorFocus
  | ComponentFocus;
