<script lang="ts">
  import { log5 } from "src/utils/utils/Log5";
  import type { FieldValueData } from "src/utils/views/Field";
  import FocusView from "src/utils/views/FocusView.svelte";
  import HugInput from "src/utils/views/HugInput.svelte";

  const log55 = log5("FieldValue.svelte");

  export let fieldData: FieldValueData;

  const { isFocused$, isEditing$, value$ } = fieldData;
</script>

<FocusView
  on:mousedown={fieldData.handleClick}
  focused={$isFocused$}
  class="text-emphatic font-mono"
>
  <HugInput
    isEditing={$isEditing$}
    on:input={fieldData.handleInput}
    value={$value$}
  ></HugInput>
</FocusView>
