import { Context, Layer, Effect, PubSub, Stream } from "effect";
import { type ComboboxOption, ComboboxCtx } from "src/utils/views/Combobox";

interface ComponentOption {
  label: string;
  component: string;
}

export class ComponentSelectCtx extends Context.Tag("ComponentSelectCtx")<
  ComponentSelectCtx,
  {}
>() {}

export const ComponentSelectCtxLive = Layer.effect(
  ComponentSelectCtx,
  Effect.gen(function* () {
    return {
      createComboboxProps() {
        return Effect.gen(function* () {
          const comboboxCtx = yield* ComboboxCtx;
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
  })
);
