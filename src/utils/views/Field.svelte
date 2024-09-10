<script lang="ts">
  import type { FieldData } from "src/utils/views/Field";
  import FieldLabel from "src/utils/views/FieldLabel.svelte";
  import FieldValue from "src/utils/views/FieldValue.svelte";

  export let fieldData: FieldData;
</script>

<div class="flex flex-row">
  <FieldLabel label={fieldData.label} />
  <FieldValue {fieldData} />
</div>
