<script lang="ts">
  import { Effect } from "effect";
  import FieldLabel from "src/utils/views/FieldLabel.svelte";
  import type { Readable } from "svelte/motion";
  import { dexMakeSvelteScope, DexRuntime } from "../utils/DexRuntime";
  import type { DexSetupItem } from "../utils/DexUtils";
  import type { TextFieldState } from "./TextField";
  import TextField from "./TextField.svelte";

  export let label: string;
  let textFields: Readable<Array<DexSetupItem<TextFieldState>>>;
  let ready = false;

  dexMakeSvelteScope().then((_scope) => {
    Effect.gen(function* () {
      ready = true;
    }).pipe(DexRuntime.runPromise);
  });
</script>

{#if ready}
  <div class="flex">
    <div class="flex">
      <FieldLabel {label} />
      <div class="flex gap-2">
        {#each $textFields as textField, i (textField.id)}
          {#if i > 0}
            <div class="divider divider-horizontal m-0 w-0" />
          {/if}
          <TextField setup={textField.setup} />
        {/each}
      </div>
    </div>
  </div>
{/if}
