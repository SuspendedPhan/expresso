import { map } from "rxjs";
import type MainContext from "src/main-context/MainContext";
import { DexWindow } from "src/main-context/MainViewContext";
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

    const newActionsScope = new KeyboardScope(
      focusManager.getFocus$().pipe(
        map((focus) => {
          return (
            focus.type === "Focus2" &&
            Focus2Union.is.ProjectComponentList(focus.focus2) &&
            ProjectComponentListFocusUnion.is.NewActionsFocus(
              focus.focus2.pclFocus
            )
          );
        })
      )
    );

    newActionsScope.hotkeys("c", () => {
      ctx.mutator.addBlankProjectComponent();
    });
  }
}
