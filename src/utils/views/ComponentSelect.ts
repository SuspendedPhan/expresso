import { Effect, Layer, Ref, Stream, SubscriptionRef } from "effect";
import { ComponentCtx } from "src/ctx/ComponentCtx";
import type { ExObject } from "src/ex-object/ExObject";
import {
    ExObjectFocusFactory
} from "src/focus/ExObjectFocus";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import { ComboboxCtx } from "src/utils/views/Combobox";
import type { ComboboxFieldPropsIn } from "src/utils/views/ComboboxField";
import { createFieldValueData } from "src/utils/views/Field";
import { isType } from "variant";

export interface ComponentOption {
  label: string;
  component: string;
}

export class ComponentSelectCtx extends Effect.Tag("ComponentSelectCtx")<
  ComponentSelectCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  return {
    createComboboxFieldPropsIn(exObject: ExObject) {
      return Effect.gen(function* () {
        const comboboxCtx = yield* ComboboxCtx;
        const componentCtx = yield* ComponentCtx;

        const options: ComponentOption[] = [
          { label: "Option 1", component: "Option1" },
          { label: "Option 2", component: "Option2" },
          { label: "Option 3", component: "Option3" },
        ];

        const optionsPub = yield* SubscriptionRef.make<ComponentOption[]>(
          options
        );
        const props = yield* comboboxCtx.createProps<ComponentOption>({
          options: optionsPub.changes,
        });

        yield* Effect.forkDaemon(
          Stream.runForEach(props.propsOut.onOptionSelected, (value) => {
            return Effect.gen(function* () {
              console.log(`Selected: ${value.label}`);
            });
          })
        );

        yield* Effect.forkDaemon(
          Stream.runForEach(props.propsOut.onQueryChanged, (query) => {
            return Effect.gen(function* () {
              console.log(`Query: ${query}`);
              const filteredOptions = options.filter((option) => {
                const ok =
                  option.label.toLowerCase().includes(query.toLowerCase()) ||
                  query === "";
                return ok;
              });

              console.log("Filtered options", filteredOptions);

              yield* Ref.set(optionsPub, filteredOptions);
            });
          })
        );

        const result: ComboboxFieldPropsIn<ComponentOption> = {
          propsIn: props.propsIn,
          label: "Component",
          fieldValueData: yield* createFieldValueData({
            createEditingFocusFn: (isEditing) =>
              ExObjectFocusFactory.Component({ exObject, isEditing }),
            focusIsFn: (focus) => isType(focus, ExObjectFocusFactory.Component),
            filterFn: (focus) => focus.exObject === exObject,
          }),
          // todp: read exObject.component stream
          displayValue: yield* EffectUtils.streamToReadable(
            exObject.component.changes.pipe(
                EffectUtils.switchMap((component) => componentCtx.getName(component))
            )
          ),
        };
        return result;
      });
    },
  };
});

export const ComponentSelectCtxLive = Layer.effect(
  ComponentSelectCtx,
  ctxEffect
);
