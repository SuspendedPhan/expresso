<script lang="ts">
  import FocusView from "src/utils/views/FocusView.svelte";
  import HugInput from "src/utils/views/HugInput.svelte";
  import type { TextFieldValueData } from "src/utils/views/TextField";

  export let fieldData: TextFieldValueData;

  const { focusViewPropIn, isEditing$, value$ } = fieldData;
</script>

<FocusView propIn={focusViewPropIn} class="text-emphatic font-mono">
  <HugInput
    isEditing={$isEditing$}
    on:input={fieldData.handleInput}
    value={$value$}
  ></HugInput>
</FocusView>
