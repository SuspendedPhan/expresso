<script lang="ts">
  import { Effect, Stream, PubSub } from "effect";
  import type { ExObject } from "src/ex-object/ExObject";
  import { DexRuntime } from "src/utils/utils/DexRuntime";
  import { ComboboxCtx, type ComboboxPropsIn } from "src/utils/views/Combobox";
  import Combobox from "src/utils/views/Combobox.svelte";

  interface ComponentOption {
    label: string;
    component: string;
  }

  export let exObject: ExObject = null as any;

  const options: ComponentOption[] = [
    { label: "Option 1", component: "Option1" },
    { label: "Option 2", component: "Option2" },
    { label: "Option 3", component: "Option3" },
  ];

  let comboboxPropsIn: ComboboxPropsIn<ComponentOption>;
  DexRuntime.runPromise(
    Effect.gen(function* () {
      const comboboxCtx = yield* ComboboxCtx;
      const optionsPub = yield* PubSub.unbounded<ComponentOption[]>();
      const props = yield* comboboxCtx.createProps<ComponentOption>({
        options: Stream.fromPubSub(optionsPub),
      });
      comboboxPropsIn = props.propsIn;

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
            yield* optionsPub.publish(
              options.filter((option) =>
                option.label.toLowerCase().includes(query.toLowerCase())
              )
            );
          });
        })
      );
    })
  );
</script>

<Combobox propsIn={comboboxPropsIn} />
