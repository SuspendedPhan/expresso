import type MainContext from "src/main-context/MainContext";
import { DexWindow } from "src/main-context/MainViewContext";
import { FocusKind } from "src/utils/focus/FocusKind";
import { Focus2 } from "src/utils/focus/FocusKind2";
import type { DexVariantKind } from "src/utils/utils/VariantUtils4";
import { variantCosmos, type VariantOf } from "variant";

const TAG = "projectComponentWindowFocusKind";
const ProjectComponentWindowFocusCosmos = variantCosmos({
  key: TAG,
});

export const ProjectComponentWindowFocus =
  ProjectComponentWindowFocusCosmos.variant({
    NewActions: {},
  });

export type ProjectComponentWindowFocus = VariantOf<
  typeof ProjectComponentWindowFocus
>;
export type ProjectComponentWindowFocusKind = DexVariantKind<
  typeof ProjectComponentWindowFocus,
  typeof TAG
>;

export function createProjectComponentWindowFocus(ctx: MainContext) {
  const { focusCtx } = ctx;
  return {};
}

export function registerProjectComponentWindowFocus(ctx: MainContext) {
  const { focusCtx, keyboardCtx } = ctx;

  keyboardCtx
    .onKeydown$(
      "n",
      ctx.viewCtx.activeWindowEqualTo$(DexWindow.ProjectComponents)
    )
    .subscribe(async () => {
      focusCtx.setFocus(
        Focus2.ProjectComponentWindowFocus(
          ProjectComponentWindowFocus.NewActions()
        )
      );
    });
}
