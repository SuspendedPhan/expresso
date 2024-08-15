import { firstValueFrom } from "rxjs";
import type MainContext from "src/main-context/MainContext";
import { DexWindow } from "src/main-context/MainViewContext";
import { FocusKeys, FocusKind } from "src/utils/utils/Focus";
import { KeyboardFuncs } from "src/utils/utils/Keyboard";

export const EditorFocusKind = {
  EditorNewActions: {},
};

export namespace EditorFocusFuncs {
  export async function register(ctx: MainContext) {
    const { focusCtx } = ctx;

    KeyboardFuncs.onKeydown$(
      "n",
      ctx.viewCtx.activeWindowEqualTo$(DexWindow.ProjectEditor)
    ).subscribe(() => {
      focusCtx.setFocus(FocusKind.EditorNewActions());
    });

    const focusIsEditorNewActions$ = focusCtx.mapFocus$(
      FocusKind.is.EditorNewActions
    );

    ctx.viewCtx.commandCardCtx.addCommandCard({
      title: "Editor",
      commands: ["n"],
      visible$: focusIsEditorNewActions$,
    });

    KeyboardFuncs.onKeydown$(
      "o",
      focusIsEditorNewActions$
    ).subscribe(() => {
      ctx.projectMutator.addRootObject();
      focusCtx.popFocus();
    });

    KeyboardFuncs.onKeydown$(
      FocusKeys.Down,
      focusCtx.mapFocus$(FocusKind.is.None)
    ).subscribe(async () => {
      const project = await firstValueFrom(ctx.projectManager.currentProject$);
      const rootExObjects = await firstValueFrom(project.rootExObjects$);
      const exObject = rootExObjects[0];
      if (exObject === undefined) {
        return;
      }

      focusCtx.setFocus(FocusKind.ExObject({ exObject }));
    });
  }
}
