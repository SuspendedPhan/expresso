import { combineLatestWith, firstValueFrom, map } from "rxjs";
import type { ExItem } from "src/ex-object/ExItem";
import type MainContext from "src/main-context/MainContext";
import { DexWindow } from "src/main-context/MainViewContext";
import { dexVariant, type DexVariantKind } from "src/utils/utils/VariantUtils4";
import { pass, type VariantOf } from "variant";
import { FocusKind } from "../focus/FocusKind";

interface EditorFocus_ {
    EditorNewActions: { exItem: ExItem | null };
}

export const EditorFocusFactory = dexVariant.scoped("EditorFocus")(dexVariant.typed<EditorFocus_>({
    EditorNewActions: pass,
}));

export type EditorFocus = VariantOf<typeof EditorFocusFactory>;
export type EditorFocusKind = DexVariantKind<typeof EditorFocusFactory>;


export namespace EditorFocusFuncs {
  export async function register(ctx: MainContext) {
    const { focusCtx, keyboardCtx } = ctx;

    keyboardCtx
      .onKeydown$(
        "n",
        ctx.viewCtx.activeWindowEqualTo$(DexWindow.ProjectEditor).pipe(
          combineLatestWith(focusCtx.mapFocus$(FocusKind.is.None)),
          map(([activeWindow, noneFocus]) => {
            return activeWindow && noneFocus;
          })
        )
      )
      .subscribe(async () => {
        const exItem = await firstValueFrom(ctx.exObjectFocusCtx.exItemFocus$);
        focusCtx.setFocus(
          FocusKind.EditorNewActions({
            exItem: exItem === false ? null : exItem,
          })
        );
      });

    const focusIsEditorNewActions$ = focusCtx.mapFocus$((focus) => {
      return FocusKind.is.EditorNewActions(focus) ? focus : false;
    });

    ctx.viewCtx.commandCardCtx.addCommandCard({
      title: "Editor Commands",
      commands: ["New Object", "New Project"],
      visible$: focusIsEditorNewActions$.pipe(map((focus) => focus !== false)),
    });

    keyboardCtx.onKeydown$("p", focusIsEditorNewActions$).subscribe(async () => {
      const library = await firstValueFrom(ctx.library$);
      library.addProjectBlank();
      focusCtx.popFocus();
    });

    keyboardCtx.onKeydown$("o", focusIsEditorNewActions$).subscribe(async() => {
      const project = await ctx.projectCtx.getCurrentProjectProm();
      project.addRootExObjectBlank();
      focusCtx.popFocus();
    });

    keyboardCtx.registerCancel(focusIsEditorNewActions$);
  }
}
