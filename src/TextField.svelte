<script lang="ts">
  import { Effect } from "effect";
  import { AppStateCtx } from "./AppStateCtx";
  import { DexFocusGetter } from "./DexFocus";
  import { DexRuntime } from "./DexRuntime";
  import FieldLabel from "./FieldLabel.svelte";
  import FocusView from "./FocusView.svelte";
  import HugInput from "./HugInput.svelte";
  import type { TextFieldProps } from "./TextField";

  export let props: TextFieldProps;

  let ready = false;
  let value: string;

  Effect.gen(function* () {
    const state = yield* AppStateCtx.getAppState;
    value = DexFocusGetter.textFieldValue(state);

    ready = true;
  }).pipe(DexRuntime.runPromise);
</script>

<div class="flex flex-row">
  {#if props.label}
    <FieldLabel label={props.label}></FieldLabel>
  {/if}
  <FocusView props={props.focusViewProps} class="text-emphatic font-mono">
    <HugInput isEditing={state.isEditing} on:input={onInput} value={state.value}></HugInput>
  </FocusView>
</div>
