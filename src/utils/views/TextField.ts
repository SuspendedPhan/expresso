import { Deferred, Effect, Layer, PubSub, Scope, Stream } from "effect";
import { DexRuntime } from "src/utils/utils/DexRuntime";
import type { Readable } from "svelte/motion";
import { writable } from "svelte/store";
import { EffectUtils } from "../utils/EffectUtils";
import type { FocusViewProp, FocusViewPropIn } from "./FocusView";

export type TextFieldPropIn = (
  svelteScope: Scope.Scope
) => Effect.Effect<TextFieldState>;

export interface TextFieldPropOut {
  value: Stream.Stream<string>;
}

export type TextFieldProp = [TextFieldPropIn, TextFieldPropOut];

export interface TextFieldState {
  label: string;
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
      label: string,
      value: Stream.Stream<string>,
      focusViewProp: FocusViewProp
    ): Effect.Effect<[TextFieldPropIn, TextFieldPropOut]> => {
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
              label: label,
              value: value_,
              isEditing: yield* EffectUtils.streamToReadableScoped(
                focusViewProp[1].isEditing.pipe(
                  Deferred.await,
                  Effect.timeout(500),
                  Effect.orDie,
                  Stream.unwrap
                ),
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
