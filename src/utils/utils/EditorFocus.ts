import assert from "assert-ts";
import { firstValueFrom, map } from "rxjs";
import type MainContext from "src/main-context/MainContext";
import { DexWindow } from "src/main-context/MainViewContext";
import { CommandCardFns } from "src/utils/utils/CommandCard";
import { FocusFns } from "src/utils/utils/Focus";
import { Focus2Kind } from "src/utils/utils/FocusManager";
import { FocusScope } from "src/utils/utils/FocusScope";
import { ArrayFns } from "./Utils";

export namespace EditorFocus {
  export function register(ctx: MainContext) {
    const focusManager = ctx.focusManager;
    const editorScope = new FocusScope(
      ctx.viewCtx.activeWindow$.pipe(
        map((window) => window === DexWindow.ProjectEditor)
      )
    );
    editorScope.hotkeys("n", async () => {
      const focus = await firstValueFrom(focusManager.getFocus$());
      if (
        focus.type === "Focus2" &&
        Focus2Kind.is.EditorNewActions(focus.focus2)
      ) {
        return;
      }

      ctx.focusManager.focus({
        type: "Focus2",
        focus2: Focus2Kind.EditorNewActions({}),
      });
    });

    const isNewActionsFocused$ = FocusFns.isFocus2Focused$(
      ctx,
      Focus2Kind.is.EditorNewActions
    );
    CommandCardFns.add(ctx, {
      title: "New Actions",
      commands: ["Add Object", "New Project"],
      visible$: isNewActionsFocused$,
    });

    const newActionsScope = new FocusScope(isNewActionsFocused$);
    newActionsScope.hotkeys("p", () => {
      ctx.projectManager.addProjectNew();
      ctx.focusManager.popFocus();
    });

    newActionsScope.hotkeys("o", () => {
      ctx.projectMutator.addRootObject();
      ctx.focusManager.popFocus();
    });

    newActionsScope.hotkeys("Esc", () => {
      ctx.focusManager.popFocus();
    });

    newActionsScope.hotkeys("c", async() => {
      const focus = ArrayFns.getFromBack(focusManager.focusStack, 1);
      assert(focus !== undefined);
      
      console.error("fix this");
      
      // ExObjectFns.addChildBlank(ctx, focus.exItem);
      ctx.focusManager.popFocus();
    });
  }
}
