import { combineLatestWith, firstValueFrom, map } from "rxjs";
import type { ExItem } from "src/ex-object/ExItem";
import type MainContext from "src/main-context/MainContext";
import { DexWindow } from "src/main-context/MainViewContext";
import { FocusKind } from "./FocusKind";
import { ofType } from "unionize";

export const EditorFocusKind = {
  EditorNewActions: ofType<{ exItem: ExItem | null }>(),
};

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

    keyboardCtx.onKeydown$("p", focusIsEditorNewActions$).subscribe(() => {
      ctx.projectManager.addProjectNew();
      focusCtx.popFocus();
    });

    keyboardCtx.onKeydown$("o", focusIsEditorNewActions$).subscribe(() => {
      ctx.projectMutator.addRootObject();
      focusCtx.popFocus();
    });

    keyboardCtx.registerCancel(focusIsEditorNewActions$);

    // keyboardCtx.onKeydown$(
    //   "r",
    //   focusIsEditorNewActions$
    // ).subscribe(async (focus) => {
    //   const exItem = focus.exItem;
    //   if (exItem === null) {
    //     return;
    //   }

    //   const exObject = await ExObjectFns.getExObject(exItem);
    //   ExObjectFns.addBasicPropertyBlank(ctx, exObject);
    //   focusCtx.popFocus();
    // });

    // keyboardCtx.onKeydown$(
    //   "c",
    //   focusIsEditorNewActions$
    // ).subscribe(async (focus) => {
    //   const exItem = focus.exItem;
    //   if (exItem === null) {
    //     return;
    //   }

    //   const exObject = await ExObjectFns.getExObject(exItem);
    //   ExObjectFns.addChildBlank(ctx, exObject);
    //   focusCtx.popFocus();
    // });

  }
}
