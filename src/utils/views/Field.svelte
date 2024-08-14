<script>
  import FocusView from "./FocusView.svelte";
  import HugInput from "./HugInput.svelte";

  export let value;
  export let isFocused;
  export let isEditing;
</script>

<div class="flex flex-row">
  <pre class="text-style-secondary">Name: </pre>
  <FocusView on:mousedown focused={isFocused} class="text-emphatic">
    <HugInput {isEditing} on:input {value}></HugInput>
  </FocusView>
</div>
