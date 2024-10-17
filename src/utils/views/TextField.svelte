<script lang="ts">
  import { Effect } from "effect";
  import FieldLabel from "src/utils/views/FieldLabel.svelte";
  import { dexMakeSvelteScope, DexRuntime } from "../utils/DexRuntime";
  import FocusView from "./FocusView.svelte";
  import HugInput from "./HugInput.svelte";
  import type { TextFieldState } from "./TextField";
  import type { DexSetup } from "../utils/EffectUtils";

  export let setup: DexSetup<TextFieldState>;

  let label: TextFieldState["label"];
  let value: TextFieldState["value"];
  let isEditing: TextFieldState["isEditing"];
  let onInput: TextFieldState["onInput"];
  let focusViewPropIn: TextFieldState["focusViewPropIn"];

  let ready = false;

  dexMakeSvelteScope().then((scope) => {
    Effect.gen(function* () {
      const state = yield* setup(scope);
      label = state.label;
      value = state.value;
      onInput = state.onInput;
      focusViewPropIn = state.focusViewPropIn;
    }).pipe(DexRuntime.runPromise);
  });
</script>

{#if ready}
  <div class="flex flex-row">
    {#if label}
      <FieldLabel {label} />
    {/if}
    <FocusView propIn={focusViewPropIn} class="text-emphatic font-mono">
      <HugInput isEditing={$isEditing} on:input={onInput} value={$value}
      ></HugInput>
    </FocusView>
  </div>
{/if}
