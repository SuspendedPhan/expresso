<script lang="ts">
  import type { DexObject } from "./Domain";

  export let dexObject: DexObject;
</script>

<div>
  <div>Name: {dexObject.name}</div>
  <div class="flex flex-row">
    {#each dexObject.children as child}
      <svelte:self dexObject={child} />
    {/each}
  </div>
</div>
