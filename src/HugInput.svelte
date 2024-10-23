<script lang="ts">
  export let value: string;
  export let isEditing: boolean;

  let input: HTMLInputElement;
  $: if (isEditing) {
    const position = input.value.length; // Set the caret position at the end of the text
    input.focus();
    input.setSelectionRange(position, position);
  }
</script>

<div class="text-left relative">
  <input
    bind:this={input}
    class="text-emphatic outline-none absolute left-0 w-full bg-transparent"
    {value}
    readonly={!isEditing}
    on:input
  />
  <pre class="text-emphatic">{value}</pre>
</div>
