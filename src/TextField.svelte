<script lang="ts">
  import { Effect } from "effect";
  import type { TextFieldFocusTarget } from "./DexFocus";
  import { DexRuntime } from "./DexRuntime";
  import FieldLabel from "./FieldLabel.svelte";
  import FocusView from "./FocusView.svelte";
  import HugInput from "./HugInput.svelte";
  import { TextFieldGetter, type TextFieldState } from "./TextField";

  export let target: TextFieldFocusTarget;

  let state: TextFieldState;

  Effect.gen(function* () {
    state = TextFieldGetter.state(target);
  }).pipe(DexRuntime.runPromise);
</script>

{#if state}
  <div class="flex flex-row">
    {#if state.label}
      <FieldLabel label={state.label}></FieldLabel>
    {/if}
    <FocusView {target} class="text-emphatic font-mono">
      <HugInput {target}></HugInput>
    </FocusView>
  </div>
{/if}
