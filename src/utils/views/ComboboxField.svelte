<script lang="ts" generics="T extends ComboboxOption">
  import type { Readable } from "svelte/store";

  import type {
    ComboboxOption,
    ComboboxPropsIn,
  } from "src/utils/views/Combobox";
  import Combobox from "src/utils/views/Combobox.svelte";
  import type { FieldValueData } from "src/utils/views/Field";
  import FocusView from "src/utils/views/FocusView.svelte";
  import HugInput from "src/utils/views/HugInput.svelte";

  export let propsIn: ComboboxPropsIn<T>;
  export let fieldValueData: FieldValueData;
  export let displayValue: Readable<string>;

  const isFocused$ = fieldValueData.isFocused$;
  const isEditing$ = fieldValueData.isEditing$;
  const handleClick = fieldValueData.handleClick;
</script>

<FocusView
  on:mousedown={handleClick}
  focused={$isFocused$}
  class="text-emphatic font-mono"
>
  <HugInput isEditing={$isEditing$} value={$displayValue}></HugInput>
  <Combobox {propsIn} />
</FocusView>
