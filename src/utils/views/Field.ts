import { Effect, Layer, Option, Scope } from "effect";
import { Focus2Ctx, type FocusTarget } from "src/focus/Focus2";
import { log5 } from "src/utils/utils/Log5";
import { writable, type Readable } from "svelte/store";

const log55 = log5("Field.ts");

export type FieldViewPropIn = (
  svelteScope: Scope.Scope
) => Effect.Effect<FieldViewState>;

export interface FieldViewState {
  label: Readable<string | null>;
}

export class FieldCtx extends Effect.Tag("FieldCtx")<
  FieldCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {

  const focus2Ctx = yield* Focus2Ctx;

  return {
    createProps: (label: Option.Option<string>, focusTarget: FocusTarget): FieldViewPropIn => {
      return (svelteScope: Scope.Scope) => {
        return Effect.gen(function* () {

          const vv: FieldViewState = {
            label: writable(Option.getOrNull(label)),
          };
          return vv;
        });
      };
    },
  };
});

export const FieldCtxLive = Layer.effect(FieldCtx, ctxEffect);
