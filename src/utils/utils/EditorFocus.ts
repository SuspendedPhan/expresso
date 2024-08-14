import assert from "assert-ts";
import { map, firstValueFrom } from "rxjs";
import { ExItemType } from "src/ex-object/ExItem";
import { ExObjectFns } from "src/ex-object/ExObject";
import type MainContext from "src/main-context/MainContext";
import { DexWindow } from "src/main-context/MainViewContext";
import { CommandCardFns } from "src/utils/utils/CommandCard";
import { FocusFns } from "src/utils/utils/Focus";
import { Focus2Union } from "src/utils/utils/FocusManager";
import { KeyboardScope } from "src/utils/utils/KeyboardScope";
import { ArrayFns } from "./Utils";

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
      
      if (focus.type !== "ExItem") {
        return;
      }
      if (focus.exItem.itemType === ExItemType.ExObject) {
        ExObjectFns.addChildBlank(ctx, focus.exItem);
      }
      ctx.focusManager.popFocus();
    });
  }
}
