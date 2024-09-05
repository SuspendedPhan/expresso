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

export async function createProjectComponentWindowFocusCtx(ctx: MainContext) {
  const { focusCtx, keyboardCtx } = ctx;

  console.log("Registering ProjectComponentWindowFocus");
  keyboardCtx
    .onKeydown$(
      "n",
      ctx.viewCtx.activeWindowEqualTo$(DexWindow.ProjectComponents)
    )
    .subscribe(async () => {
      console.log("New component actions");
      focusCtx.setFocus(ProjectComponentWindowFocus.NewActions());
    });

  ctx.viewCtx.commandCardCtx.addCommandCard({
    title: "Project Component Commands",
    commands: ["New Component"],
    visible$: focusCtx.mapFocus2$((f) =>
      isType(f, ProjectComponentWindowFocus.NewActions)
    ),
  });

  keyboardCtx
    .onKeydown2$({
      keys: "c",
      data$: focusCtx.mapFocus2$((f) =>
        isType(f, ProjectComponentWindowFocus.NewActions)
      ),
    })
    .subscribe(async () => {
      console.log("Create new component");
      ctx.projectCtx.addComponentBlank();
      focusCtx.popFocus();
      focusCtx.popFocus();
    });
}
