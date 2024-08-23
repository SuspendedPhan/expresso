<script lang="ts">
  import type MainContext from "src/main-context/MainContext";
  import FieldLabel from "src/utils/views/FieldLabel.svelte";
  import FocusView from "./FocusView.svelte";
  import HugInput from "./HugInput.svelte";
  import type { Field } from "src/utils/views/Field";

  export let ctx: MainContext;
  export let field: Field;

  const { isFocused$, isEditing$, value$ } = field;
</script>

<div class="flex flex-row">
  <FieldLabel label={field.label} />
  <FocusView on:mousedown focused={$isFocused$} class="text-emphatic">
    <HugInput
      isEditing={$isEditing$}
      on:input={field.handleInput}
      value={$value$}
    ></HugInput>
  </FocusView>
</div>
