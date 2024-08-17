import assert from "assert-ts";
import { filter, firstValueFrom, map } from "rxjs";
import { ExItemType, type Expr } from "src/ex-object/ExItem";
import type MainContext from "src/main-context/MainContext";
import { FocusKind, Hotkeys } from "src/utils/utils/Focus";
import type { OBS } from "src/utils/utils/Utils";
import { ofType } from "unionize";

export const ExprFocusKind = {
  Expr: ofType<{ expr: Expr; isEditing: boolean }>(),
};

export namespace ExprFocusFuncs {
  export function createContext(ctx: MainContext) {
    return {
      get exprFocus$(): OBS<typeof FocusKind._TaggedRecord.Expr | false> {
        return ctx.focusCtx.mapFocus$((focus) => {
          return FocusKind.is.Expr(focus) ? focus : false;
        });
      },

      exprFocused$(expr: Expr): OBS<boolean> {
        return ctx.focusCtx.mapFocus$((focus) => {
          return FocusKind.is.Expr(focus) && focus.expr === expr;
        });
      },

      editing$() {
        return ctx.focusCtx.mapFocus$((focus) => {
          return FocusKind.is.Expr(focus) && focus.isEditing;
        }
      },
    };
  }

  export async function register(ctx: MainContext) {
    const { focusCtx, keyboardCtx } = ctx;
    const { exObjectFocusCtx, exprFocusCtx } = focusCtx;

    // keyboardCtx
    //   .onKeydown$(
    //     "e",
    //     focusCtx.focus$.pipe(
    //     filter((focus) => {return FocusKind.is.Expr(focus) && !focus.isEditing}),

    //     )
    //   )
    //   .subscribe(async (expr) => {
    //     // focusCtx.setFocus(FocusKind.Expr({ expr, isEditing: true }));
    //   });

    // keyboardCtx.onKeydown$("Enter",

    keyboardCtx
      .onKeydown$(Hotkeys.Down, exObjectFocusCtx.propertyFocus$)
      .subscribe(async (property) => {
        const expr = await firstValueFrom(property.expr$);
        focusCtx.setFocus(FocusKind.Expr({ expr, isEditing: false }));
      });

    keyboardCtx
      .onKeydown$(Hotkeys.Up, exprFocusCtx.exprFocus$)
      .subscribe(async (focus) => {
        const expr = focus.expr;
        const parent = await firstValueFrom(expr.parent$);
        assert(parent !== null);

        if (parent.itemType === ExItemType.Property) {
          const property = parent;
          focusCtx.setFocus(FocusKind.Property({ property }));
        }
      });
  }
}
