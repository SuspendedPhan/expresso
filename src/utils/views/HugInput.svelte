<script lang="ts">
  export let value: string;
  export let isEditing: boolean;
</script>

<div class="text-left relative">
  <input
    class="text-emphatic outline-none absolute left-0 w-full"
    class:ring={isEditing}
    {value}
    readonly={!isEditing}
    on:input
  />
  <div class="text-emphatic">{value}</div>
</div>
