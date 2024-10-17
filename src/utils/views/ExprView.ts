import assert from "assert-ts";
import { Effect, Layer, Stream } from "effect";
import { of } from "rxjs";
import { ExFunc } from "src/ex-object/ExFunc";
import { Expr, ExprFactory } from "src/ex-object/Expr";
import { FocusKind2, FocusTarget } from "src/focus/Focus2";
import type { Readable } from "svelte/motion";
import { matcher } from "variant";
import type { ElementLayout } from "../layout/ElementLayout";
import type { DexSetupItem } from "../utils/DexUtils";
import { EffectUtils, type DexSetup } from "../utils/EffectUtils";
import { FocusViewCtx, type FocusViewPropIn } from "./FocusView";

export interface ExprViewPropOut {}

export interface ExprViewState {
  expr: Expr;
  text: Readable<string>;
  isEditing: Readable<boolean>;
  args: Readable<Array<DexSetupItem<ExprViewState>>>;
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
    createProp(
      expr: Expr,
      elementLayout: ElementLayout
    ): Effect.Effect<ExprViewProp> {
      const exprViewCreateProp = (expr: Expr, elementLayout: ElementLayout) =>
        this.createProp(expr, elementLayout);

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

              let args = Stream.make(new Array<DexSetupItem<ExprViewState>>());
              if (expr.type === "Expr/Call") {
                args = expr.args.itemStream.pipe(
                  Stream.mapEffect((args) => {
                    return Effect.gen(function* () {
                      const setups = new Array<DexSetupItem<ExprViewState>>();
                      for (const arg of args) {
                        const prop = yield* exprViewCreateProp(
                          arg,
                          elementLayout
                        );
                        setups.push({
                          setup: prop.setup,
                          id: arg.id,
                        });
                      }
                      return setups;
                    });
                  })
                );
              }

              const [focusViewPropIn, focusViewPropOut] =
                yield* focusviewctx.createProps(
                  new FocusTarget({ item: expr, kind: FocusKind2("Expr") }),
                  true
                );

              const state: ExprViewState = {
                expr,
                text: text3,
                args: yield* EffectUtils.makeScopedReadableFromStream(
                  args,
                  svelteScope
                ),
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
