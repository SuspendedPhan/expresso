<script lang="ts" generics="T extends ComboboxOption">
  import type { ComboboxFieldPropsIn } from "src/utils/views/ComboboxField";

  import type { ComboboxOption } from "src/utils/views/Combobox";
  import Combobox from "src/utils/views/Combobox.svelte";
  import FocusView from "src/utils/views/FocusView.svelte";
  import FieldLabel from "src/utils/views/FieldLabel.svelte";

  export let propsIn: ComboboxFieldPropsIn<T>;

  let comboboxPropsIn = propsIn.propsIn;
  let fieldValueData = propsIn.fieldValueData;
  let displayValue = propsIn.displayValue;

  const isFocused$ = fieldValueData.isFocused$;
  const isEditing$ = fieldValueData.isEditing$;
  const handleClick = fieldValueData.handleClick;

  // todp: popover API
</script>

<div class="flex flex-row">
  <FieldLabel label={propsIn.label} />
  <FocusView
    on:mousedown={handleClick}
    focused={$isFocused$}
    class="text-emphatic font-mono"
  >
    <pre class="text-emphatic">{$displayValue}</pre>
    {#if $isEditing$}
      <Combobox propsIn={comboboxPropsIn} />
    {/if}
  </FocusView>
</div>
