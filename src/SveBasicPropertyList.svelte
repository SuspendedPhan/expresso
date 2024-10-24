<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { DexBasicProperty } from "./DexDomain";
  import ExObjectButton from "./ExObjectButton.svelte";
  import ExObjectHeaderView from "./ExObjectHeaderView.svelte";
  import SveProperty from "./SveProperty.svelte";

  const dispatch = createEventDispatcher();

  export let properties: DexBasicProperty[];
</script>

<div class="flex flex-col gap-2">
  {#if properties.length > 0}
    <ExObjectHeaderView>Properties</ExObjectHeaderView>
  {/if}
  {#each properties as property (property.id)}
    <SveProperty {property} />
  {/each}
  <ExObjectButton on:click={() => dispatch("addProperty")} class={properties.length > 0 ? "mt-2" : ""}
    >Add Property</ExObjectButton
  >
</div>
