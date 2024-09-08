import { Effect } from "effect";
import { combineLatestWith, firstValueFrom, map } from "rxjs";
import { ExObjectFocusCtx } from "src/ctx/ExObjectFocusCtx";
import { FocusCtx } from "src/ctx/FocusCtx";
import { KeyboardCtx } from "src/ctx/KeyboardCtx";
import { DexWindow, ViewCtx } from "src/ctx/ViewCtx";
import type { ExItem } from "src/ex-object/ExItem";
import { FocusFactory } from "src/focus/Focus";
import { dexVariant, type DexVariantKind } from "src/utils/utils/VariantUtils4";
import { isType, pass, type VariantOf } from "variant";

interface EditorFocus_ {
  EditorNewActions: { exItem: ExItem | null };
}

export const EditorFocusFactory = dexVariant.scoped("EditorFocus")(
  dexVariant.typed<EditorFocus_>({
    EditorNewActions: pass,
  })
);

export type EditorFocus = VariantOf<typeof EditorFocusFactory>;
export type EditorFocusKind = DexVariantKind<typeof EditorFocusFactory>;

const registerEditorFocus = Effect.gen(function* () {
  const focusCtx = yield* FocusCtx;
  const keyboardCtx = yield* KeyboardCtx;
  const viewCtx = yield* ViewCtx;
  const exObjectFocusCtx = yield* ExObjectFocusCtx;
  const commandCardCtx = yield* CommandCardCtx;

  keyboardCtx
    .onKeydown$(
      "n",
      viewCtx.activeWindowEqualTo$(DexWindow.ProjectEditor).pipe(
        combineLatestWith(focusCtx.mapFocus$(isType(FocusFactory.None))),
        map(([activeWindow, noneFocus]) => {
          return activeWindow && noneFocus;
        })
      )
    )
    .subscribe(async () => {
      const exItem = await firstValueFrom(exObjectFocusCtx.exItemFocus$);
      focusCtx.setFocus(
        FocusKind.EditorNewActions({
          exItem: exItem === false ? null : exItem,
        })
      );
    });

  const focusIsEditorNewActions$ = focusCtx.mapFocus$((focus) => {
    return FocusKind.is.EditorNewActions(focus) ? focus : false;
  });

  viewCtx.commandCardCtx.addCommandCard({
    title: "Editor Commands",
    commands: ["New Object", "New Project"],
    visible$: focusIsEditorNewActions$.pipe(map((focus) => focus !== false)),
  });

  keyboardCtx.onKeydown$("p", focusIsEditorNewActions$).subscribe(async () => {
    const library = await firstValueFrom(ctx.library$);
    library.addProjectBlank();
    focusCtx.popFocus();
  });

  keyboardCtx.onKeydown$("o", focusIsEditorNewActions$).subscribe(async () => {
    const project = await ctx.projectCtx.getCurrentProjectProm();
    project.addRootExObjectBlank();
    focusCtx.popFocus();
  });

  keyboardCtx.registerCancel(focusIsEditorNewActions$);
});

