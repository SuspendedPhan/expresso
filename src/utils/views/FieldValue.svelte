<script lang="ts">
  import { log5 } from "src/utils/utils/Log5";
  import FocusView from "src/utils/views/FocusView.svelte";
  import HugInput from "src/utils/views/HugInput.svelte";
  import type { TextFieldValueData } from "src/utils/views/TextField";

  const log55 = log5("FieldValue.svelte");

  export let fieldData: TextFieldValueData;

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
