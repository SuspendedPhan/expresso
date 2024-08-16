import type { Expr } from "src/ex-object/ExItem";
import type MainContext from "src/main-context/MainContext";
import { FocusKind } from "src/utils/utils/Focus";
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

  export async function register(_ctx: MainContext) {}
}
