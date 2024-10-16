import { Effect, Layer } from "effect";
import type { DexSetup } from "../utils/EffectUtils";
import { TextFieldCtx, type TextFieldProp } from "./TextField";
import type { ExObject } from "src/ex-object/ExObject";

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

  return {
    createProp: (exObject: ExObject): Effect.Effect<ExObjectViewProp> => {
      return Effect.gen(function* () {
        const prop: ExObjectViewProp = {
          setup: (s) => Effect.gen(function* () {
            const state: ExObjectViewState = {
                nameFieldProp: textFieldCtx.createProps("Name", exObject.name),
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
