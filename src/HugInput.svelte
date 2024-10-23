<script lang="ts">
  import { Effect, Option } from "effect";

  import { onMount } from "svelte";
  import { AppStateCtx } from "./AppStateCtx";
  import { DexRuntime } from "./DexRuntime";

  export let value: string;
  export let isEditing: boolean;

  let input: HTMLInputElement;

  onMount(() => {
    console.log("HugInput");
    Effect.gen(function* () {
      if (isEditing) {
        yield* Effect.sleep(0);
        input.focus();
        const state = yield* AppStateCtx.getAppState;
        const focus = Option.getOrThrow(state.focus);
        const selectionRange = Option.getOrThrow(focus.inputCursorIndex);
        input.setSelectionRange(selectionRange.start, selectionRange.end);
      }
    }).pipe(DexRuntime.runPromise);
  });
</script>

<div class="text-left relative">
  <input
    bind:this={input}
    class="text-emphatic outline-none absolute left-0 w-full bg-transparent"
    {value}
    readonly={!isEditing}
    on:input
  />
  <pre class="text-emphatic">{value}</pre>
</div>
