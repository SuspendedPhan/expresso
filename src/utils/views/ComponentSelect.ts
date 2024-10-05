import { Effect, Layer, PubSub, Stream } from "effect";
import { ComboboxCtx } from "src/utils/views/Combobox";

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
    createComboboxProps() {
      return Effect.gen(function* () {
        const comboboxCtx = yield* ComboboxCtx;

        const options: ComponentOption[] = [
          { label: "Option 1", component: "Option1" },
          { label: "Option 2", component: "Option2" },
          { label: "Option 3", component: "Option3" },
        ];

        const optionsPub = yield* PubSub.unbounded<ComponentOption[]>();
        const props = yield* comboboxCtx.createProps<ComponentOption>({
          options: Stream.fromPubSub(optionsPub),
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

              yield* optionsPub.publish(filteredOptions);
            });
          })
        );

        return props.propsIn;
      });
    },
  };
});

export const ComponentSelectCtxLive = Layer.effect(
  ComponentSelectCtx,
  ctxEffect
);
