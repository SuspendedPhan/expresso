import { Effect, Layer } from "effect";
import type { DexSetup } from "../utils/EffectUtils";
import { ExprViewCtx, type ExprViewState } from "./ExprView";
import type { Expr } from "src/ex-object/Expr";
import { ElementLayout } from "../layout/ElementLayout";
import { createExprLayout } from "../layout/ExprLayout";

export interface RootExprViewPropOut {}

export interface RootExprViewState {
  exprViewSetup: DexSetup<ExprViewState>;
  elementLayout: ElementLayout;
}

export interface RootExprViewProp {
  setup: DexSetup<RootExprViewState>;
  out: RootExprViewPropOut;
}

export class RootExprViewCtx extends Effect.Tag("RootExprViewCtx")<
  RootExprViewCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const exprviewctx = yield* ExprViewCtx;

  return {
    createProp: (expr: Expr): Effect.Effect<RootExprViewProp> => {
      return Effect.gen(function* () {
        const prop: RootExprViewProp = {
          setup: (_svelteScope) =>
            Effect.gen(function* () {
              const layout = yield* createExprLayout(expr);

              const state: RootExprViewState = {
                elementLayout: layout,
                exprViewSetup: (yield* exprviewctx.createProp(expr, layout))
                  .setup,
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

export const RootExprViewCtxLive = Layer.effect(RootExprViewCtx, ctxEffect);
