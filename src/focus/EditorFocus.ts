import { Effect, Layer } from "effect";
import { combineLatestWith, firstValueFrom, map } from "rxjs";
import { ExObjectFocusCtx } from "src/ctx/ExObjectFocusCtx";
import { FocusCtx, FocusCtxLive } from "src/ctx/FocusCtx";
import { KeyboardCtx } from "src/ctx/KeyboardCtx";
import { DexWindow, ViewCtx } from "src/ctx/ViewCtx";
import { ExItem } from "src/ex-object/ExItem";
import { ExItemFocus } from "src/focus/ExItemFocus";
import { FocusFactory } from "src/focus/Focus";
import { CommandCardCtx } from "src/utils/utils/CommandCard";
import { EffectUtils } from "src/utils/utils/EffectUtils";
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

export const EditorFocus = {
  register: Effect.gen(function* () {
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
        const effect = Effect.gen(function* () {
          const exItem$ = yield* ExItemFocus.exItemBasicFocus$;
          const exItem = yield* EffectUtils.firstValueFrom(exItem$);
          focusCtx.setFocus(
            EditorFocusFactory.EditorNewActions({
              exItem: exItem === false ? null : exItem,
            })
          );
        }).pipe(Effect.provide(Layer.provide(FocusCtxLive)));
        
        Effect.runPromise();
        const exItem = await firstValueFrom(
          yield * ExItemFocus.exItemBasicFocus$
        );
        focusCtx.setFocus(
          EditorFocusFactory.EditorNewActions({
            exItem: exItem === false ? null : exItem,
          })
        );
        // focusCtx.setFocus(
        //   FocusKind.EditorNewActions({
        //     exItem: exItem === false ? null : exItem,
        //   })
        // );
      });

    const focusIsEditorNewActions$ = focusCtx.mapFocus$((focus) => {
      return FocusKind.is.EditorNewActions(focus) ? focus : false;
    });

    commandCardCtx.addCommandCard({
      title: "Editor Commands",
      commands: ["New Object", "New Project"],
      visible$: focusIsEditorNewActions$.pipe(map((focus) => focus !== false)),
    });

    keyboardCtx
      .onKeydown$("p", focusIsEditorNewActions$)
      .subscribe(async () => {
        const library = await firstValueFrom(ctx.library$);
        library.addProjectBlank();
        focusCtx.popFocus();
      });

    keyboardCtx
      .onKeydown$("o", focusIsEditorNewActions$)
      .subscribe(async () => {
        const project = await ctx.projectCtx.getCurrentProjectProm();
        project.addRootExObjectBlank();
        focusCtx.popFocus();
      });

    keyboardCtx.registerCancel(focusIsEditorNewActions$);
  }),
};
