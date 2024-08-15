import type MainContext from "src/main-context/MainContext";
import { DexWindow } from "src/main-context/MainViewContext";
import { FocusKind } from "src/utils/utils/Focus";
import { KeyboardFuncs } from "src/utils/utils/Keyboard";

export const EditorFocusKind = {
  EditorNewActions: {},
};

export namespace EditorFocusFuncs {
  export async function register(ctx: MainContext) {
    KeyboardFuncs.onKeydown$(
      "n",
      ctx.viewCtx.activeWindowEqualTo$(DexWindow.ProjectEditor)
    ).subscribe(() => {
      ctx.focusCtx.setFocus(FocusKind.EditorNewActions());
    });
  }
}
