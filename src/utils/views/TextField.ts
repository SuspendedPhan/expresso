import { Effect, Layer, Option, PubSub, Scope, Stream } from "effect";
import { DexRuntime } from "src/utils/utils/DexRuntime";
import type { Readable } from "svelte/motion";
import { writable } from "svelte/store";
import { EffectUtils, type DexSetup } from "../utils/EffectUtils";
import type { FocusViewProp, FocusViewPropIn } from "./FocusView";


export interface TextFieldPropOut {
  value: Stream.Stream<string>;
}

export type TextFieldProp = [DexSetup<TextFieldState>, TextFieldPropOut];

export interface TextFieldState {
  label: string | null;
  value: Readable<string>;
  isEditing: Readable<boolean>;
  onInput: (e: any) => void;
  focusViewPropIn: FocusViewPropIn;
}

export class TextFieldCtx extends Effect.Tag("TextFieldCtx")<
  TextFieldCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  return {
    createProps: (
      label: Option.Option<string>,
      value: Stream.Stream<string>,
      focusViewProp: FocusViewProp
    ): Effect.Effect<[DexSetup<TextFieldState>, TextFieldPropOut]> => {
      return Effect.gen(function* () {
        const valueOut = yield* PubSub.unbounded<string>();

        const createState = (svelteScope: Scope.Scope) => {
          return Effect.gen(function* () {
            Scope.addFinalizer(svelteScope, valueOut.shutdown);

            const value_ = writable("");

            yield* value.pipe(
              Stream.runForEachScoped((v) =>
                Effect.gen(function* () {
                  value_.set(v);
                })
              ),
              Scope.extend(svelteScope)
            );

            const vv: TextFieldState = {
              label: Option.getOrNull(label),
              value: value_,
              isEditing: yield* EffectUtils.streamToReadableScoped(
                focusViewProp[1].isEditing,
                svelteScope
              ),
              onInput: (e: any) =>
                Effect.gen(function* () {
                  const v = e.target.value;
                  const v2 = v === "" ? "a" : v;
                  yield* valueOut.publish(v2);
                }).pipe(DexRuntime.runPromise),
              focusViewPropIn: focusViewProp[0],
            };
            return vv;
          });
        };

        const propOut: TextFieldPropOut = {
          value: Stream.fromPubSub(valueOut),
        };

        return [createState, propOut];
      });
    },
  };
});

export const TextFieldCtxLive = Layer.effect(TextFieldCtx, ctxEffect);
