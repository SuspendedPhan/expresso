import assert from "assert-ts";
import { firstValueFrom } from "rxjs";
import { ExItemType, type Expr } from "src/ex-object/ExItem";
import type MainContext from "src/main-context/MainContext";
import { FocusKind, Hotkeys } from "src/utils/utils/Focus";
import type { OBS } from "src/utils/utils/Utils";
import { ofType } from "unionize";

export const ExprFocusKind = {
  Expr: ofType<{ expr: Expr }>(),
};

export namespace ExprFocusFuncs {
  export function createContext(ctx: MainContext) {
    function mapExprFocus$(
      focusKindCheck: (obj: any) => boolean
    ): OBS<Expr | false> {
      return ctx.focusCtx.mapFocus$((focus) => {
        if (!focusKindCheck(focus)) {
          return false;
        }
        return (focus as any).expr;
      });
    }

    return {
      get exprFocus$() {
        return mapExprFocus$(FocusKind.is.Expr);
      },
    };
  }

  export async function register(ctx: MainContext) {
    const { focusCtx, keyboardCtx } = ctx;
    const { exObjectFocusCtx, exprFocusCtx } = focusCtx;
    keyboardCtx
      .onKeydown$(Hotkeys.Down, exObjectFocusCtx.propertyFocus$)
      .subscribe(async (property) => {
        const expr = await firstValueFrom(property.expr$);
        focusCtx.setFocus(FocusKind.Expr({ expr }));
      });

    keyboardCtx
      .onKeydown$(Hotkeys.Up, exprFocusCtx.exprFocus$)
      .subscribe(async (expr) => {
        const parent = await firstValueFrom(expr.parent$);
        assert(parent !== null);

        if (parent.itemType === ExItemType.Property) {
          const property = parent;
          focusCtx.setFocus(FocusKind.Property({ property }));
        }
      });
  }
}
