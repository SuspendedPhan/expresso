import { Effect, Layer, Scope, Stream } from "effect";
import { Focus2Ctx, type FocusTarget } from "src/focus/Focus2";
import type { ComboboxOption, ComboboxPropsIn } from "src/utils/views/Combobox";
import { type Readable } from "svelte/store";
import { EffectUtils } from "../utils/EffectUtils";
import { FocusViewCtx, type FocusViewPropIn } from "./FocusView";

export type ComboboxFieldPropsIn<T extends ComboboxOption> = (
  svelteScope: Scope.Scope
) => Effect.Effect<ComboboxFieldState<T>>;

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
  const focus2Ctx = yield* Focus2Ctx;

  return {
    createProps<T extends ComboboxOption>(
      label: string,
      value: Stream.Stream<string>,
      focusTarget: FocusTarget,
      comboboxPropsIn: ComboboxPropsIn<T>
    ) {
      const createState = (svelteScope: Scope.Scope) =>
        Effect.gen(function* () {
          const focusViewPropIn = focusViewCtx.createProps(focusTarget, true);
          const isEditing = focus2Ctx.focusByTarget(focusTarget).pipe(
            Stream.unwrap,
            Stream.flatMap((focus) => focus.isEditing.changes, { switch: true })
          );
          const vv: ComboboxFieldState<T> = {
            label: label,
            value: yield* EffectUtils.streamToReadableScoped(
              value,
              svelteScope
            ),
            isEditing: yield* EffectUtils.streamToReadableScoped(
              isEditing,
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
