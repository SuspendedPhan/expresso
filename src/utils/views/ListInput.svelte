<script lang="ts">
  import { switchMap } from "rxjs";
  import { log5 } from "src/utils/utils/Log5";
  import { RxFns, type OBS } from "src/utils/utils/Utils";
  import type { FieldValueData } from "src/utils/views/Field";
  import FieldLabel from "src/utils/views/FieldLabel.svelte";
  import FieldValue from "src/utils/views/FieldValue.svelte";

  const log55 = log5("ListInput.svelte");

  export let label: string;
  export let fieldValueDataArr$: OBS<FieldValueData[]>;

  let fieldValueDataArr = new Array<FieldValueData>();
  RxFns.onMount$()
    .pipe(switchMap(() => fieldValueDataArr$))
    .subscribe((fieldValueDataArr) => {
      log55.debug("fieldValueDataArr", fieldValueDataArr);
      fieldValueDataArr = fieldValueDataArr;
    });
</script>

<div class="flex">
  <div class="flex">
    <FieldLabel {label} />
    <div class="flex gap-2">
      {#each fieldValueDataArr as fieldValueData, i (fieldValueData.id)}
        {#if i > 0}
          <div class="divider divider-horizontal m-0 w-0" />
        {/if}
        <FieldValue fieldData={fieldValueData} />
      {/each}
    </div>
  </div>
</div>
