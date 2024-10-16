import { Effect, Layer, Scope, Stream } from "effect";
import { type FocusTarget } from "src/focus/Focus2";
import type { ComboboxOption, ComboboxPropsIn } from "src/utils/views/Combobox";
import { type Readable } from "svelte/store";
import { EffectUtils } from "../utils/EffectUtils";
import { FocusViewCtx, type FocusViewPropIn } from "./FocusView";

export type ComboboxFieldPropIn<T extends ComboboxOption> = (
  svelteScope: Scope.Scope
) => Effect.Effect<ComboboxFieldState<T>>;

export type ComboboxFieldProp<T extends ComboboxOption> = ComboboxFieldPropIn<T>;

export interface ComboboxFieldState<T extends ComboboxOption> {
  label: string;
  value: Readable<string>;
  isEditing: Readable<boolean>;

  focusViewPropIn: FocusViewPropIn;
  comboboxPropsIn: ComboboxPropsIn<T>;
}

export class ComboboxFieldCtx extends Effect.Tag("ComboboxFieldCtx")<
  ComboboxFieldCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const focusViewCtx = yield* FocusViewCtx;

  return {
    createProps<T extends ComboboxOption>(
      label: string,
      value: Stream.Stream<string>,
      focusTarget: FocusTarget,
      comboboxPropsIn: ComboboxPropsIn<T>
    ) {
      const createState = (svelteScope: Scope.Scope) =>
        Effect.gen(function* () {
          const [focusViewPropIn, focusViewPropOut] =
            yield* focusViewCtx.createProps(focusTarget, true);
          const vv: ComboboxFieldState<T> = {
            label: label,
            value: yield* EffectUtils.streamToReadableScoped(
              value,
              svelteScope
            ),
            isEditing: yield* EffectUtils.streamToReadableScoped(
              focusViewPropOut.isEditing,
              svelteScope
            ),
            focusViewPropIn,
            comboboxPropsIn,
          };
          return vv;
        });
      return createState;
    },
  };
});

export const ComboboxFieldCtxLive = Layer.effect(ComboboxFieldCtx, ctxEffect);
