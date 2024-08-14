<script lang="ts">
  import { firstValueFrom } from "rxjs";
  import type { OBS, SUB } from "src/utils/utils/Utils";
  import FocusView from "./FocusView.svelte";
  import HugInput from "./HugInput.svelte";
  import assert from "assert-ts";

  export let label;
  export let value$: OBS<string> | SUB<string>;
  export let isFocused;
  export let isEditing;

  async function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    if (value === "") {
      target.value = await firstValueFrom(value$);
      return;
    }

    assert("next" in value$);
    value$.next(target.value);
  }
</script>

<div class="flex flex-row">
  <pre class="text-style-secondary">{label}: </pre>
  <FocusView on:mousedown focused={isFocused} class="text-emphatic">
    <HugInput {isEditing} on:input={handleInput} value={$value$}></HugInput>
  </FocusView>
</div>
