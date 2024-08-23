<script lang="ts">
  import type MainContext from "src/main-context/MainContext";
  import type { FieldData } from "src/utils/views/Field";
  import FocusView from "src/utils/views/FocusView.svelte";
  import HugInput from "src/utils/views/HugInput.svelte";

  export let ctx: MainContext;
  export let fieldData: FieldData;

  const { isFocused$, isEditing$, value$ } = fieldData;
</script>

<FocusView
  on:mousedown={fieldData.handleClick}
  focused={$isFocused$}
  class="text-emphatic"
>
  <HugInput
    isEditing={$isEditing$}
    on:input={fieldData.handleInput}
    value={$value$}
  ></HugInput>
</FocusView>
