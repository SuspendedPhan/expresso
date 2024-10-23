<script lang="ts">
  import FieldLabel from "./FieldLabel.svelte";
  import FocusView from "./FocusView.svelte";
  import HugInput from "./HugInput.svelte";
  import type { TextFieldProps } from "./TextField";

  export let props: TextFieldProps;
</script>

<div class="flex flex-row">
  {#if props.label}
    <FieldLabel label={props.label}></FieldLabel>
  {/if}
  <FocusView props={props.focusViewProps} class="text-emphatic font-mono">
    <HugInput isEditing={props.isEditing} on:input={props.onInput} value={props.value}></HugInput>
  </FocusView>
</div>
