import type MainContext from "src/main-context/MainContext";
import { DexWindow } from "src/main-context/MainViewContext";
// import { Focus2 } from "src/utils/focus/FocusKind2";
import type { DexVariantKind } from "src/utils/utils/VariantUtils4";
import { isType, scoped, variant, type VariantOf } from "variant";

export const ProjectComponentWindowFocus = variant(
  scoped("Focus/ProjectComponentWindow", {
    NewActions: {},
  })
);

export type ProjectComponentWindowFocus = VariantOf<
  typeof ProjectComponentWindowFocus
>;
export type ProjectComponentWindowFocusKind = DexVariantKind<
  typeof ProjectComponentWindowFocus
>;

export function createProjectComponentWindowFocusCtx(ctx: MainContext) {
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
      console.log("New component actions");
      focusCtx.setFocus(ProjectComponentWindowFocus.NewActions());
    });

  keyboardCtx.onKeydown2$({
    keys: "c",
    data$: focusCtx.mapFocus2$(f => isType(f, ProjectComponentWindowFocus.NewActions)),
  }).subscribe(async () => {
    console.log("Create new component");
  });
}
