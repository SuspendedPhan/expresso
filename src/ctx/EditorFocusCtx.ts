import { Context, Layer, Effect } from "effect";
import { combineLatestWith, map, firstValueFrom } from "rxjs";
import { FocusCtx } from "src/ctx/FocusCtx";
import { KeyboardCtx } from "src/ctx/KeyboardCtx";
import { DexWindow } from "src/main-context/MainViewContext";
import type { DexEffectSuccess } from "src/utils/utils/Utils";

export class EditorFocusCtx extends Context.Tag("EditorFocusCtx")<
  EditorFocusCtx,
  DexEffectSuccess<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const keyboardCtx = yield* KeyboardCtx;
  const focusCtx = yield* FocusCtx;
  const viewCtx = yield* ViewCtx;

  return {
    register() {

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
          const exItem = await firstValueFrom(
            ctx.exObjectFocusCtx.exItemFocus$
          );
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
        visible$: focusIsEditorNewActions$.pipe(
          map((focus) => focus !== false)
        ),
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
    },
  };
});

export const EditorFocusCtxLive = Layer.effect(EditorFocusCtx, ctxEffect);
