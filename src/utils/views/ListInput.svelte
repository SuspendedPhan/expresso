<script lang="ts">
  import type { OBS } from "src/utils/utils/Utils";
  import type { FieldValueData } from "src/utils/views/Field";
  import FieldLabel from "src/utils/views/FieldLabel.svelte";
  import FieldValue from "src/utils/views/FieldValue.svelte";

  export let label: string;
  export let fieldValueDataArr$: OBS<FieldValueData[]>;
</script>

<div class="flex">
  <FieldLabel {label} />
  <div class="flex gap-2">
    {#each $fieldValueDataArr$ as fieldValueData, i (fieldValueData.id)}
      {#if i > 0}
        <div class="divider divider-horizontal m-0 w-0" />
      {/if}
      <FieldValue {ctx} fieldData={fieldValueData} />
    {/each}
  </div>
</div>
