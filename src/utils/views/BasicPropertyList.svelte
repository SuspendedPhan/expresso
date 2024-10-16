<script lang="ts">
  import ExObjectButton from "src/utils/views/ExObjectButton.svelte";
  import PropertyView from "src/utils/views/PropertyView.svelte";

  import type { PropertyKind } from "src/ex-object/Property";
  import ExObjectHeaderView from "src/utils/views/ExObjectHeaderView.svelte";
  import type { Readable } from "svelte/store";

  export let basicProperties: Readable<PropertyKind["BasicProperty"][]>;
  export let addPropertyFn: () => void;
</script>

<div class="flex flex-col gap-2">
  {#if $basicProperties.length > 0}
    <ExObjectHeaderView>Properties</ExObjectHeaderView>
  {/if}
  {#each $basicProperties as property (property.id)}
    <PropertyView {property} />
  {/each}
  <ExObjectButton
    on:click={addPropertyFn}
    class={$basicProperties.length > 0 ? "mt-2" : ""}
    >Add Property</ExObjectButton
  >
</div>
