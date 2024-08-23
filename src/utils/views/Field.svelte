<script lang="ts">
  import type MainContext from "src/main-context/MainContext";
  import FieldLabel from "src/utils/views/FieldLabel.svelte";
  import FocusView from "./FocusView.svelte";
  import HugInput from "./HugInput.svelte";
  import type { FieldData } from "src/utils/views/Field";

  export let ctx: MainContext;
  export let fieldData: FieldData;

  const { isFocused$, isEditing$, value$ } = fieldData;
</script>

<div class="flex flex-row">
  <FieldLabel label={fieldData.label} />
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
</div>
