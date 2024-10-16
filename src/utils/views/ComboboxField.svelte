<script lang="ts" generics="T extends ComboboxOption">
  import { dexMakeSvelteScope, DexRuntime } from "../utils/DexRuntime";

  import type {
    ComboboxFieldPropsIn,
    ComboboxFieldState,
  } from "src/utils/views/ComboboxField";

  import type { ComboboxOption } from "src/utils/views/Combobox";
  import Combobox from "src/utils/views/Combobox.svelte";
  import FieldLabel from "src/utils/views/FieldLabel.svelte";
  import FocusView from "src/utils/views/FocusView.svelte";
  import { Effect } from "effect";

  export let propsIn: ComboboxFieldPropsIn<T>;

  let label: ComboboxFieldState<T>["label"];
  let value: ComboboxFieldState<T>["value"];
  let isEditing: ComboboxFieldState<T>["isEditing"];
  let comboboxPropsIn: ComboboxFieldState<T>["comboboxPropsIn"];
  let focusViewPropIn: ComboboxFieldState<T>["focusViewPropIn"];

  dexMakeSvelteScope().then((scope) => {
    Effect.gen(function* () {
      const state = yield* propsIn(scope);
      label = state.label;
      value = state.value;
      isEditing = state.isEditing;
      comboboxPropsIn = state.comboboxPropsIn;
      focusViewPropIn = state.focusViewPropIn;
    }).pipe(DexRuntime.runPromise);
  });

  // todp: popover API
</script>

<div class="flex flex-row relative">
  <FieldLabel {label} />
  <FocusView propIn={focusViewPropIn} class="text-emphatic font-mono">
    <pre class="text-emphatic">{$value}</pre>
    {#if $isEditing}
      <Combobox propsIn={comboboxPropsIn} />
    {/if}
  </FocusView>
</div>
