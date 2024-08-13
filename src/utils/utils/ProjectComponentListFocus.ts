import { map } from "rxjs";
import type MainContext from "src/main-context/MainContext";
import { DexWindow } from "src/main-context/MainViewContext";
import { CommandCardFns } from "src/utils/utils/CommandCard";
import { Focus2Union, type Focus2Wrapper } from "src/utils/utils/FocusManager";
import { KeyboardScope } from "src/utils/utils/KeyboardScope";
import unionize, { type UnionOf } from "unionize";

export const ProjectComponentListFocusUnion = unionize({
  NewActionsFocus: {},
});

export type ProjectComponentListFocus = UnionOf<
  typeof ProjectComponentListFocusUnion
>;

export namespace ProjectComponentListFocusFns {
  export function register(ctx: MainContext) {
    const focusManager = ctx.focusManager;

    const windowScope = new KeyboardScope(
      ctx.viewCtx.activeWindowEqualTo$(DexWindow.ProjectComponentList)
    );

    windowScope.hotkeys("n", () => {
      const detail = ProjectComponentListFocusUnion.NewActionsFocus({});
      const focus = Focus2Union.ProjectComponentList({ pclFocus: detail });
      const wrapper: Focus2Wrapper = {
        type: "Focus2",
        focus2: focus,
      };
      focusManager.focus(wrapper);
    });

    const isNewActionsFocused$ = focusManager.getFocus$().pipe(
      map((focus) => {
        return (
          focus.type === "Focus2" &&
          Focus2Union.is.ProjectComponentList(focus.focus2) &&
          ProjectComponentListFocusUnion.is.NewActionsFocus(
            focus.focus2.pclFocus
          )
        );
      })
    );

    CommandCardFns.add(ctx, {
      title: "New Actions",
      commands: ["Add Component"],
      visible$: isNewActionsFocused$,
    });

    const newActionsScope = new KeyboardScope(isNewActionsFocused$);
    newActionsScope.hotkeys("c", () => {
      ctx.mutator.addBlankProjectComponent();
      ctx.focusManager.popFocus();
    });
  }
}
