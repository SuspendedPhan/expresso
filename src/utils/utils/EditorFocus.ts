import { map, firstValueFrom } from "rxjs";
import type MainContext from "src/main-context/MainContext";
import { DexWindow } from "src/main-context/MainViewContext";
import { CommandCardFns } from "src/utils/utils/CommandCard";
import { FocusFns } from "src/utils/utils/Focus";
import { Focus2Union } from "src/utils/utils/FocusManager";
import { KeyboardScope } from "src/utils/utils/KeyboardScope";

export namespace EditorFocus {
  export function register(ctx: MainContext) {
    const focusManager = ctx.focusManager;
    const editorScope = new KeyboardScope(
      ctx.viewCtx.activeWindow$.pipe(
        map((window) => window === DexWindow.ProjectEditor)
      )
    );
    editorScope.hotkeys("n", async () => {
      const focus = await firstValueFrom(focusManager.getFocus$());
      if (
        focus.type === "Focus2" &&
        Focus2Union.is.EditorNewActions(focus.focus2)
      ) {
        return;
      }

      ctx.focusManager.focus({
        type: "Focus2",
        focus2: Focus2Union.EditorNewActions({}),
      });
    });

    const isNewActionsFocused$ = FocusFns.isFocus2Focused$(
      ctx,
      Focus2Union.is.EditorNewActions
    );
    CommandCardFns.add(ctx, {
      title: "New Actions",
      commands: ["Add Object", "New Project"],
      visible$: isNewActionsFocused$,
    });

    const newActionsScope = new KeyboardScope(isNewActionsFocused$);
    newActionsScope.hotkeys("p", () => {
      ctx.projectManager.addProjectNew();
      ctx.focusManager.focusNone();
    });

    newActionsScope.hotkeys("o", () => {
      ctx.projectMutator.addRootObject();
      ctx.focusManager.focusNone();
    });

    newActionsScope.hotkeys("Esc", () => {
      ctx.focusManager.popFocus();
    });
  }
}
