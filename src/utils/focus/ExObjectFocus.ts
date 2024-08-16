import { firstValueFrom } from "rxjs";
import type { ExObject } from "src/ex-object/ExObject";
import type { Property } from "src/ex-object/Property";
import type MainContext from "src/main-context/MainContext";
import { Hotkeys, FocusKind } from "src/utils/utils/Focus";
import { ofType } from "unionize";

export const createExObjectFocusContext = (ctx: MainContext) => {
  return {
    get exObjectFocus$() {
      return ctx.focusCtx.mapFocus$((focus) => {
        return FocusKind.is.ExObject(focus) ? focus.exObject : false;
      });
    },

    get exObjectNameFocus$() {
      return ctx.focusCtx.mapFocus$((focus) => {
        return FocusKind.is.ExObjectName(focus) ? focus.exObject : false;
      });
    }
  }
};

export const ExObjectFocusKind = {
  ExObject: ofType<{ exObject: ExObject }>(),
  ExObjectName: ofType<{ exObject: ExObject }>(),
  ExObjectComponent: ofType<{ exObject: ExObject }>(),
  Property: ofType<{ property: Property }>(),
};

export namespace ExObjectFocusFuncs {
  export async function register(ctx: MainContext) {
    const { focusCtx, keyboardCtx } = ctx;

    keyboardCtx
      .onKeydown$(Hotkeys.Down, focusCtx.mapFocus$(FocusKind.is.None))
      .subscribe(async () => {
        const project = await firstValueFrom(
          ctx.projectManager.currentProject$
        );
        const objs = await firstValueFrom(project.rootExObjects$);
        const obj = objs[0];
        if (obj === undefined) {
          return;
        }

        focusCtx.setFocus(FocusKind.ExObject({ exObject: obj }));
      });

    const exObjectFocus$ = focusCtx.mapFocus$((focus) => {
      return FocusKind.is.ExObject(focus) ? focus.exObject : false;
    });

    keyboardCtx
      .onKeydown$(Hotkeys.Down, focusCtx.exObjectFocusCtx.exObjectFocus$, "hi")
      .subscribe((exObject) => {

        focusCtx.setFocus(FocusKind.ExObjectName({ exObject }));
      });

    keyboardCtx
      .onKeydown$(Hotkeys.Up, exObjectFocus$)
      .subscribe((exObject) => {
        focusCtx.setFocus(FocusKind.ExObjectComponent({ exObject }));
      });
  }
}
