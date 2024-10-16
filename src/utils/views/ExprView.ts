import { Effect, Layer } from "effect";
import { Expr, ExprFactory } from "src/ex-object/Expr";
import type { Readable } from "svelte/motion";
import type { ElementLayout } from "../layout/ElementLayout";
import { EffectUtils, type DexSetup } from "../utils/EffectUtils";
import { FocusViewCtx, type FocusViewPropIn } from "./FocusView";
import assert from "assert-ts";
import { of } from "rxjs";
import { ExFunc } from "src/ex-object/ExFunc";
import { matcher } from "variant";
import { writable } from "svelte/store";
import { FocusKind2, FocusTarget } from "src/focus/Focus2";

export interface ExprViewPropOut {}

export interface ExprViewState {
  expr: Expr;
  text: Readable<string>;
  isEditing: Readable<boolean>;
  args: Readable<Expr[]>;
  elementLayout: ElementLayout;
  focusViewPropIn: FocusViewPropIn;
}

export interface ExprViewProp {
  setup: DexSetup<ExprViewState>;
  out: ExprViewPropOut;
}

export class ExprViewCtx extends Effect.Tag("ExprViewCtx")<
  ExprViewCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const focusviewctx = yield* FocusViewCtx;

  return {
    createProp: (
      expr: Expr,
      elementLayout: ElementLayout
    ): Effect.Effect<ExprViewProp> => {
      return Effect.gen(function* () {
        const prop: ExprViewProp = {
          setup: (svelteScope) =>
            Effect.gen(function* () {
              const text = matcher(expr)
                .when(ExprFactory.Number, (number) => {
                  return of(number.value.toString());
                })
                .when(ExprFactory.Call, (call) => {
                  assert(call.exFunc$.value !== null);
                  return ExFunc.name$(call.exFunc$.value);
                })
                .when(ExprFactory.Reference, (reference) => {
                  assert(reference.target !== null);
                  return Expr.getReferenceTargetName$(reference.target);
                })
                .complete();

              const text2 = EffectUtils.makeStreamFromObs(text);
              const text3 = yield* EffectUtils.makeScopedReadableFromStream(
                text2,
                svelteScope
              );

              const args =
                expr.type === "Expr/Call"
                  ? yield* EffectUtils.makeScopedReadableFromStream(
                      expr.args.itemStream,
                      svelteScope
                    )
                  : writable([]);

              const [focusViewPropIn, focusViewPropOut] =
                yield* focusviewctx.createProps(
                  new FocusTarget({ item: expr, kind: FocusKind2("Expr") }),
                  true
                );

              const state: ExprViewState = {
                expr,
                text: text3,
                args,
                focusViewPropIn,
                isEditing: yield* EffectUtils.makeScopedReadableFromStream(
                  focusViewPropOut.isEditing,
                  svelteScope
                ),
                elementLayout,
              };
              return state;
            }),
          out: {},
        };
        return prop;
      });
    },
  };
});

export const ExprViewCtxLive = Layer.effect(ExprViewCtx, ctxEffect);
