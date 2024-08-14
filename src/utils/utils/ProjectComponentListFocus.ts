import { firstValueFrom, map } from "rxjs";
import type MainContext from "src/main-context/MainContext";
import { DexWindow } from "src/main-context/MainViewContext";
import { CommandCardFns } from "src/utils/utils/CommandCard";
import { Focus2Union, type Focus2Wrapper } from "src/utils/utils/FocusManager";
import { KeyboardScope } from "src/utils/utils/KeyboardScope";
import unionize, { ofType, type UnionOf } from "unionize";
import { FocusFns, FocusKeys } from "./Focus";
import type { CustomComponent } from "src/ex-object/Component";

export const ProjectComponentListFocusKind = unionize({
  NewActions: {},
  Component: ofType<{ component: CustomComponent }>(),
});

export type ProjectComponentListFocus = UnionOf<
  typeof ProjectComponentListFocusKind
>;

export namespace ProjectComponentListFocusFns {
  export function register(ctx: MainContext) {
    const focusManager = ctx.focusManager;

    const windowScope = new KeyboardScope(
      ctx.viewCtx.activeWindowEqualTo$(DexWindow.ProjectComponentList)
    );

    windowScope.hotkeys("n", () => {
      const detail = ProjectComponentListFocusKind.NewActions({});
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
          ProjectComponentListFocusKind.is.NewActions(focus.focus2.pclFocus)
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

    const noneScope = new KeyboardScope(FocusFns.isNoneFocused$(ctx));
    noneScope.hotkeys(FocusKeys.Down, async () => {
      // select first component
      const project = await firstValueFrom(ctx.projectManager.currentProject$);
      const componentArr = await firstValueFrom(project.componentArr$);
      const component = componentArr[0];
      if (component === undefined) {
        return;
      }

      const focus = Focus2Union.ProjectComponentList({
        pclFocus: ProjectComponentListFocusKind.Component({ component }),
      });
      focusManager.focus({ type: "Focus2", focus2: focus });
    });
  }
}
