import { firstValueFrom } from "rxjs";
import type { ExObject } from "src/ex-object/ExObject";
import type { Property } from "src/ex-object/Property";
import type MainContext from "src/main-context/MainContext";
import { FocusKind, Hotkeys } from "src/utils/utils/Focus";
import type { OBS } from "src/utils/utils/Utils";
import { ofType } from "unionize";

export const ExObjectFocusKind = {
  ExObject: ofType<{ exObject: ExObject }>(),
  ExObjectName: ofType<{ exObject: ExObject }>(),
  ExObjectComponent: ofType<{ exObject: ExObject }>(),
  Property: ofType<{ property: Property }>(),
};

export function createExObjectFocusContext(ctx: MainContext) {
  function mapExObjectFocus$(
    focusKindCheck: (obj: any) => boolean
  ): OBS<ExObject | false> {
    return ctx.focusCtx.mapFocus$((focus) => {
      if (!focusKindCheck(focus)) {
        return false;
      }
      return (focus as any).exObject;
    });
  }

  return {
    get exObjectFocus$() {
      return mapExObjectFocus$(FocusKind.is.ExObject);
    },

    get nameFocus$() {
      return mapExObjectFocus$(FocusKind.is.ExObjectName);
    },

    get componentFocus$() {
      return mapExObjectFocus$(FocusKind.is.ExObjectComponent);
    },

    get propertyFocus$() {
      return ctx.focusCtx.mapFocus$((focus) => {
        return FocusKind.is.Property(focus) ? focus.property : false;
      });
    },
  };
}

export namespace ExObjectFocusFuncs {
  export async function register(ctx: MainContext) {
    const { focusCtx, keyboardCtx } = ctx;
    const { exObjectFocusCtx } = focusCtx;

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

    // Down

    keyboardCtx
      .onKeydown$(Hotkeys.Down, exObjectFocusCtx.exObjectFocus$, "hi")
      .subscribe((exObject) => {
        focusCtx.setFocus(FocusKind.ExObjectName({ exObject }));
      });

    keyboardCtx
      .onKeydown$(Hotkeys.Down, exObjectFocusCtx.nameFocus$)
      .subscribe((exObject) => {
        focusCtx.setFocus(FocusKind.ExObjectComponent({ exObject }));
      });

    keyboardCtx
      .onKeydown$(Hotkeys.Down, exObjectFocusCtx.componentFocus$)
      .subscribe((exObject) => {
        const property = exObject.cloneCountProperty;
        focusCtx.setFocus(FocusKind.Property({ property }));
      });

    keyboardCtx
      .onKeydown$(Hotkeys.Down, exObjectFocusCtx.propertyFocus$)
      .subscribe(async (property) => {
        const expr = await firstValueFrom(property.expr$);
        focusCtx.setFocus(FocusKind.Expr({ expr }));
      });

    // Up

    keyboardCtx
      .onKeydown$(Hotkeys.Up, exObjectFocusCtx.nameFocus$)
      .subscribe((exObject) => {
        focusCtx.setFocus(FocusKind.ExObject({ exObject }));
      });

    keyboardCtx
      .onKeydown$(Hotkeys.Up, exObjectFocusCtx.componentFocus$)
      .subscribe((exObject) => {
        focusCtx.setFocus(FocusKind.ExObjectName({ exObject }));
      });
  }
}
