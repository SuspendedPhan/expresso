<script lang="ts">
  import { Effect } from "effect";
  import { AppStateCtx } from "./AppStateCtx";
  import { DexRuntime } from "./DexRuntime";
  import FieldLabel from "./FieldLabel.svelte";
  import FocusView from "./FocusView.svelte";
  import HugInput from "./HugInput.svelte";
  import { TextFieldGetter, TextFieldReducer, type TextFieldFocusTarget, type TextFieldState } from "./TextField";

  export let target: TextFieldFocusTarget;

  let state: TextFieldState;

  Effect.gen(function* () {
    const appState = yield* AppStateCtx.getAppState;
    state = TextFieldGetter.state(appState, target);
  }).pipe(DexRuntime.runPromise);

  function onInput(event: Event) {
    DexRuntime.runPromise(AppStateCtx.runReducer(TextFieldReducer.updateValue(target, event)));
  }
</script>

{#if state}
  <div class="flex flex-row">
    {#if state.label}
      <FieldLabel label={state.label}></FieldLabel>
    {/if}
    <FocusView {target} class="text-emphatic font-mono">
      <HugInput isEditing={state.isEditing} on:input={onInput} value={state.value}></HugInput>
    </FocusView>
  </div>
{/if}
