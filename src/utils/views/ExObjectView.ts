import { Effect, Layer } from "effect";
import type { DexSetup } from "../utils/EffectUtils";
import { TextFieldCtx, type TextFieldProp } from "./TextField";
import type { ExObject } from "src/ex-object/ExObject";
import { FocusViewCtx } from "./FocusView";
import { FocusKind2, FocusTarget } from "src/focus/Focus2";

interface ExObjectViewPropOut {}

interface ExObjectViewState {
  nameFieldProp: TextFieldProp;
}

interface ExObjectViewProp {
  setup: DexSetup<ExObjectViewState>;
  out: ExObjectViewPropOut;
}

export class ExObjectViewCtx extends Effect.Tag("ExObjectViewCtx")<
  ExObjectViewCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const textFieldCtx = yield* TextFieldCtx;
  const focusViewCtx = yield* FocusViewCtx;

  return {
    createProp: (exObject: ExObject): Effect.Effect<ExObjectViewProp> => {
      return Effect.gen(function* () {
        const prop: ExObjectViewProp = {
          setup: (svelteScope) =>
            Effect.gen(function* () {
              const state: ExObjectViewState = {
                nameFieldProp: yield* textFieldCtx.createProps(
                  "Name",
                  exObject.name,
                  yield* focusViewCtx.createProps(
                    new FocusTarget({
                      kind: FocusKind2("ExObjectName"),
                      item: exObject,
                    }),
                    true
                  )
                ),
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

export const ExObjectViewCtxLive = Layer.effect(ExObjectViewCtx, ctxEffect);
