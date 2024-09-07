import assert from "assert-ts";
import { filter, firstValueFrom } from "rxjs";
import { ExItemType, ExprType, type Expr } from "src/ex-object/ExItem";
import { ExprFuncs } from "src/ex-object/Expr";
import type MainContext from "src/main-context/MainContext";
import { Hotkeys } from "src/utils/focus/Focus";
import { log5 } from "src/utils/utils/Log5";
import { ArrayFns, RxFns, type OBS } from "src/utils/utils/Utils";
import { dexVariant, type DexVariantKind } from "src/utils/utils/VariantUtils4";
import { pass, type VariantOf } from "variant";
import { FocusKind } from "./FocusKind";

const log55 = log5("ExprFocus.ts");

interface ExprFocus_ {
    Expr: { expr: Expr };
}

export const ExprFocusFactory = dexVariant.scoped("ExprFocus")(dexVariant.typed<ExprFocus_>({
    Expr: pass,
}));

export type ExprFocus = VariantOf<typeof ExprFocusFactory>;
export type ExprFocusKind = DexVariantKind<typeof ExprFocusFactory>;

export namespace ExprFocusFuncs {
  export function createContext(ctx: MainContext) {
    return {
      get exprFocus$(): OBS<typeof FocusKind._TaggedRecord.Expr | false> {
        return ctx.focusCtx.mapFocus$((focus) => {
          log55.debug("focus", focus);
          return FocusKind.is.Expr(focus) ? focus : false;
        });
      },

      getExprFocus$(
        isEditing: boolean
      ): OBS<typeof FocusKind._TaggedRecord.Expr | false> {
        return ctx.focusCtx.mapFocus$((focus) => {
          if (
            FocusKind.is.Expr(focus) &&
            focus.isEditing === isEditing
          ) {
            return focus;
          } else {
            return false;
          }
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
    const { focusCtx, keyboardCtx, exObjectFocusCtx } = ctx;
    const { exprFocusCtx } = focusCtx;

    // Replace Command

    keyboardCtx
      .onKeydown$(
        "e",
        focusCtx.focus$.pipe(
          RxFns.getOrFalsePred(FocusKind.is.Expr),
          RxFns.getOrFalse((focus) => !focus.isEditing)
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

    keyboardCtx.registerCancel(exprFocusCtx.getExprFocus$(true));

    // Down

    keyboardCtx
      .onKeydown$(Hotkeys.Down, exObjectFocusCtx.propertyFocus$)
      .subscribe(async (property) => {
        const expr = await firstValueFrom(property.expr$);
        if (expr.exprType === ExprType.NumberExpr) {
          exObjectFocusCtx.focusNextExItem(property);
        } else {
          focusCtx.setFocus(FocusKind.Expr({ expr, isEditing: false }));
        }
      });

    keyboardCtx
      .onKeydown$(Hotkeys.Down, exprFocusCtx.getExprFocus$(false))
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
            const property = await ExprFuncs.getProperty(expr);
            exObjectFocusCtx.focusNextExItem(property);
            break;
        }
      });

    // Up

    keyboardCtx
      .onKeydown$(Hotkeys.Up, exprFocusCtx.getExprFocus$(false))
      .subscribe(async (focus) => {
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

    // Left

    keyboardCtx
      .onKeydown$(Hotkeys.Left, exprFocusCtx.getExprFocus$(false))
      .subscribe(async (focus) => {
        const expr = focus.expr;
        const parent = await firstValueFrom(expr.parent$);
        assert(parent !== null);

        if (
          parent.itemType === ExItemType.Property &&
          expr.exprType === ExprType.NumberExpr
        ) {
          const property = parent;
          focusCtx.setFocus(FocusKind.Property({ property }));
          return;
        }
      });

    keyboardCtx
      .onKeydown$(Hotkeys.Left, exprFocusCtx.getExprFocus$(false))
      .subscribe(async (focus) => {
        const direction = -1;
        focusHorizontal(focus, direction);
      });

    // Right

    keyboardCtx
      .onKeydown$(Hotkeys.Right, exObjectFocusCtx.propertyFocus$)
      .subscribe(async (property) => {
        const expr = await firstValueFrom(property.expr$);
        if (expr.exprType === ExprType.NumberExpr) {
          focusCtx.setFocus(FocusKind.Expr({ expr, isEditing: false }));
        }
      });

    keyboardCtx
      .onKeydown$(Hotkeys.Right, exprFocusCtx.exprFocus$)
      .subscribe(async (focus) => {
        const direction = 1;
        focusHorizontal(focus, direction);
      });

    async function focusHorizontal(
      focus: { tag: "Expr" } & { expr: Expr; isEditing: boolean },
      direction: number
    ) {
      const expr = focus.expr;
      const parent = await firstValueFrom(expr.parent$);
      assert(parent !== null);

      if (parent.itemType !== ExItemType.Expr) return;
      if (parent.exprType !== ExprType.CallExpr) return;

      const callExpr = parent;
      const args = await firstValueFrom(callExpr.args$);
      const index = args.indexOf(expr);
      assert(index !== -1);

      const arg = ArrayFns.getWrapped(args, index + direction);
      focusCtx.setFocus(FocusKind.Expr({ expr: arg, isEditing: false }));
    }
  }
}
