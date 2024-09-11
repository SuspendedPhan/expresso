import assert from "assert-ts";
import { Effect, Layer } from "effect";
import { filter, firstValueFrom } from "rxjs";
import { KeyboardCtx } from "src/ctx/KeyboardCtx";
import type { Expr } from "src/ex-object/Expr";
import { FocusCtx, Hotkeys } from "src/focus/FocusCtx";
import { ExprCommandCtx } from "src/utils/utils/ExprCommand";
import { log5 } from "src/utils/utils/Log5";
import { ArrayFns, RxFns, type OBS } from "src/utils/utils/Utils";
import { dexVariant, type DexVariantKind } from "src/utils/utils/VariantUtils4";
import { isType, pass, type VariantOf } from "variant";

const log55 = log5("ExprFocus.ts");

interface ExprFocus_ {
  Expr: { expr: Expr; isEditing: boolean };
}

export const ExprFocusFactory = dexVariant.scoped("ExprFocus")(
  dexVariant.typed<ExprFocus_>({
    Expr: pass,
  })
);

export type ExprFocus = VariantOf<typeof ExprFocusFactory>;
export type ExprFocusKind = DexVariantKind<typeof ExprFocusFactory>;

export class ExprFocusCtx extends Effect.Tag("ExprFocusCtx")<
  ExprFocusCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const focusCtx = yield* FocusCtx;
  const keyboardCtx = yield* KeyboardCtx;
  const exprCommandCtx = yield* ExprCommandCtx;

  return {
    get exprFocus$(): OBS<ExprFocus | false> {
      return focusCtx.mapFocus$((focus) => {
        log55.debug("focus", focus);
        return isType(focus, ExprFocusFactory.Expr) ? focus : false;
      });
    },

    getExprFocus$(isEditing: boolean): OBS<ExprFocus | false> {
      return focusCtx.mapFocus$((focus) => {
        if (
          isType(focus, ExprFocusFactory.Expr) &&
          focus.isEditing === isEditing
        ) {
          return focus;
        } else {
          return false;
        }
      });
    },

    exprFocused$(expr: Expr): OBS<boolean> {
      return focusCtx.mapFocus$((focus) => {
        return isType(focus, ExprFocusFactory.Expr) && focus.expr === expr;
      });
    },

    editing$() {
      return focusCtx.mapFocus$((focus) => {
        return isType(focus, ExprFocusFactory.Expr) && focus.isEditing;
      });
    },

    register() {
      // const { exprFocusCtx } = focusCtx;
      // const focusCtx = yield* FocusCtx;

      // Replace Command

      keyboardCtx
        .onKeydown$(
          "e",
          focusCtx.focus$.pipe(
            RxFns.getOrFalsePred(isType(ExprFocusFactory.Expr)),
            RxFns.getOrFalse((focus) => !focus.isEditing)
          )
        )
        .subscribe(async (focus) => {
          focusCtx.setFocus(
            ExprFocusFactory.Expr({ expr: focus.expr, isEditing: true })
          );
        });

      keyboardCtx
        .onKeydown$(
          "Enter",
          this.exprFocus$.pipe(
            filter((focus) => focus !== false && focus.isEditing)
          )
        )
        .subscribe(async () => {
          exprCommandCtx.onSubmitExprCommand$.next();
        });

      ctx.eventBus.exprReplaced$.subscribe(async (replacement) => {
        const newExpr = replacement.newExpr;
        focusCtx.setFocus(ExprFocusFactory.Expr({ expr: newExpr, isEditing: false }));
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
            focusCtx.setFocus(ExprFocusFactory.Expr({ expr, isEditing: false }));
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
              focusCtx.setFocus(
                ExprFocusFactory.Expr({ expr: arg, isEditing: false })
              );
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
              focusCtx.setFocus(ExprFocusFactory.Expr({ expr, isEditing: false }));
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
            focusCtx.setFocus(ExprFocusFactory.Expr({ expr, isEditing: false }));
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
        focusCtx.setFocus(ExprFocusFactory.Expr({ expr: arg, isEditing: false }));
      }
    },
  };
});

export const ExprFocusCtxLive = Layer.effect(ExprFocusCtx, ctxEffect);
