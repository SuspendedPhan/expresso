import { Effect, Layer, PubSub, Scope, Stream } from "effect";
import { Subject } from "rxjs";
import { DexRuntime } from "src/utils/utils/DexRuntime";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import type { Readable } from "svelte/motion";
import { writable } from "svelte/store";

export type TextFieldPropIn = (
  svelteScope: Scope.Scope
) => Effect.Effect<TextFieldState>;

export interface TextFieldPropOut {
  value: Stream.Stream<string>;
}

export interface TextFieldState {
  label: string;
  value: Readable<string>;
  onInput: (e: InputEvent) => void;
}

export class TextFieldCtx extends Effect.Tag("TextFieldCtx")<
  TextFieldCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  return {
    createProps: (
      label: string,
      value: Stream.Stream<string>
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
              onInput: (e: any) =>
                Effect.gen(function* () {
                  const v = e.target.value;
                  const v2 = v === "" ? "a" : v;
                  yield* valueOut.publish(v2);
                }).pipe(DexRuntime.runPromise),
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
