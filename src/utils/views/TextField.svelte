<script lang="ts">
  import { Effect } from "effect";
  import FieldLabel from "src/utils/views/FieldLabel.svelte";
  import { dexMakeSvelteScope, DexRuntime } from "../utils/DexRuntime";
  import type { TextFieldPropIn, TextFieldState } from "./TextField";
  import FocusView from "./FocusView.svelte";
  import HugInput from "./HugInput.svelte";

  export let propIn: TextFieldPropIn;

  let label: TextFieldState["label"];
  let value: TextFieldState["value"];
  let isEditing: TextFieldState["isEditing"];
  let onInput: TextFieldState["onInput"];
  let focusViewPropIn: TextFieldState["focusViewPropIn"];

  dexMakeSvelteScope().then((scope) => {
    Effect.gen(function* () {
      const state = yield* propIn(scope);
      label = state.label;
      value = state.value;
      onInput = state.onInput;
      focusViewPropIn = state.focusViewPropIn;
    }).pipe(DexRuntime.runPromise);
  });
</script>

<div class="flex flex-row">
  {#if label}
    <FieldLabel {label} />
  {/if}
  <FocusView propIn={focusViewPropIn} class="text-emphatic font-mono">
    <HugInput isEditing={$isEditing} on:input={onInput} value={$value}
    ></HugInput>
  </FocusView>
</div>
