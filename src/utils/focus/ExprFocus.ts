import assert from "assert-ts";
import { filter, firstValueFrom } from "rxjs";
import { ExItemType, ExprType, type Expr } from "src/ex-object/ExItem";
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
        });
      },
    };
  }

  export async function register(ctx: MainContext) {
    const { focusCtx, keyboardCtx } = ctx;
    const { exObjectFocusCtx, exprFocusCtx } = focusCtx;

    // Replace Command

    keyboardCtx
      .onKeydown$(
        "e",
        exprFocusCtx.exprFocus$.pipe(
          filter((focus) => focus !== false && !focus.isEditing)
        )
      )
      .subscribe(async (focus) => {
        focusCtx.setFocus(
          FocusKind.Expr({ expr: focus.expr, isEditing: true })
        );
      });

    keyboardCtx
      .onKeydown$(
        "Enter",
        exprFocusCtx.exprFocus$.pipe(
          filter((focus) => focus !== false && focus.isEditing)
        )
      )
      .subscribe(async () => {
        ctx.eventBus.submitExprReplaceCommand$.next();
      });

    ctx.eventBus.exprReplaced$.subscribe(async (replacement) => {
      const newExpr = replacement.newExpr;
      focusCtx.setFocus(FocusKind.Expr({ expr: newExpr, isEditing: false }));
    });

    // Down

    keyboardCtx
      .onKeydown$(Hotkeys.Down, exObjectFocusCtx.propertyFocus$)
      .subscribe(async (property) => {
        const expr = await firstValueFrom(property.expr$);
        focusCtx.setFocus(FocusKind.Expr({ expr, isEditing: false }));
      });

    keyboardCtx
      .onKeydown$(Hotkeys.Down, exprFocusCtx.exprFocus$)
      .subscribe(async (focus) => {
        const expr = focus.expr;
        switch (expr.exprType) {
          case ExprType.CallExpr:
            const callExpr = expr;
            const args = await firstValueFrom(callExpr.args$);
            const arg = args[0];
            assert(arg !== undefined);
            focusCtx.setFocus(FocusKind.Expr({ expr: arg, isEditing: false }));
            break;
          case ExprType.NumberExpr:
            break;
        }
      });

    // Up

    keyboardCtx
      .onKeydown$(Hotkeys.Up, exprFocusCtx.exprFocus$)
      .subscribe(async (focus) => {
        console.log("Up");
        
        const expr = focus.expr;
        const parent = await firstValueFrom(expr.parent$);
        assert(parent !== null);

        switch (parent.itemType) {
          case ExItemType.Expr:
            const expr = parent;
            focusCtx.setFocus(FocusKind.Expr({ expr, isEditing: false }));
            break;
          case ExItemType.Property:
            const property = parent;
            focusCtx.setFocus(FocusKind.Property({ property }));
            break;
        }
      });
  }
}
