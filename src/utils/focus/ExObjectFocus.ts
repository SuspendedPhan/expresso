import { firstValueFrom, map } from "rxjs";
import type { ExObject } from "src/ex-object/ExObject";
import type { Property } from "src/ex-object/Property";
import type MainContext from "src/main-context/MainContext";
import { FocusFns, FocusKeys } from "src/utils/utils/Focus";
import { Focus2Kind } from "src/utils/utils/FocusManager";
import { FocusScope, FocusScopeResult } from "src/utils/utils/FocusScope";
import { ofType } from "unionize";

export const ExObjectFocusKind = {
  ExObject: ofType<{ exObject: ExObject }>(),
  ExObjectName: ofType<{ exObject: ExObject }>(),
  ExObjectComponent: ofType<{ exObject: ExObject }>(),
  Property: ofType<{ property: Property }>(),
};

export namespace ExObjectFocusFuncs {
  export async function register(ctx: MainContext) {

    const noneScope = new FocusScope(FocusFns.isNoneFocused$(ctx));
    noneScope.hotkeys(FocusKeys.Down, async () => {
      const project = await firstValueFrom(ctx.projectManager.currentProject$);
      const objs = await firstValueFrom(project.rootExObjects$);
      const obj = objs[0];
      if (obj === undefined) {
        return;
      }

      FocusFns.focus(ctx, Focus2Kind.ExObject({ exObject: obj }));
    });

    const exObjectScope = new FocusScope(
      FocusFns.getFocus$(ctx).pipe(
        map((focus) => {
          if (focus.type === "Focus2") {
            const focus2 = focus.focus2;
            if (Focus2Kind.is.ExObject(focus2)) {
              return focus2;
            }
          }
          return FocusScopeResult.OutOfScope;
        })
      )
    );
    exObjectScope.hotkeys(FocusKeys.Down, (focus) => {
      FocusFns.focus(
        ctx,
        Focus2Kind.ExObjectName({ exObject: focus.exObject })
      );
    });
  }
}
