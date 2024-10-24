<script lang="ts">
  import { Option } from "effect";

  import { Effect } from "effect";

  import { onMount } from "svelte";
  import { AppStateCtx } from "./AppStateCtx";
  import type { TextFieldFocusTarget } from "./DexFocus";
  import { DexRuntime, dexRunReducer } from "./DexRuntime";
  import { TextFieldGetter, TextFieldReducer, type HugInputState } from "./TextField";

  export let target: TextFieldFocusTarget;

  let input: HTMLInputElement;
  let state: HugInputState;

  onMount(() => {
    Effect.gen(function* () {
      const appState = yield* AppStateCtx.getAppState;
      state = TextFieldGetter.hugInputState(appState, target);

      yield* Effect.sleep(0);
      Option.map(state.selection, (selection) => {
        input.focus();
        input.setSelectionRange(selection.start, selection.end);
      });
    }).pipe(DexRuntime.runPromise);
  });

  function onInput(event: Event) {
    dexRunReducer(TextFieldReducer.updateValue(target, event));
  }
</script>

{#if state}
  <div class="text-left relative">
    <input
      bind:this={input}
      class="text-emphatic outline-none absolute left-0 w-full bg-transparent"
      value={state.value}
      readonly={state.readonly}
      on:input={onInput}
    />
    <pre class="text-emphatic">{state.value}</pre>
  </div>
{/if}
