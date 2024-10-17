<script lang="ts">
  import { Effect } from "effect";
  import ExObjectButton from "src/utils/views/ExObjectButton.svelte";
  import PropertyView from "src/utils/views/PropertyView.svelte";
  import { dexMakeSvelteScope, DexRuntime } from "../utils/DexRuntime";
  import type { DexSetup } from "../utils/EffectUtils";

  import ExObjectHeaderView from "src/utils/views/ExObjectHeaderView.svelte";
  import type { BasicPropertyListState } from "./BasicPropertyList";

  export let setup: DexSetup<BasicPropertyListState>;

  let properties: BasicPropertyListState["properties"];
  let onClickAddProperty: BasicPropertyListState["onClickAddProperty"];

  dexMakeSvelteScope().then((scope) => {
    Effect.gen(function* () {
      const state = yield* setup(scope);
      properties = state.properties;
      onClickAddProperty = state.onClickAddProperty;
    }).pipe(DexRuntime.runPromise);
  });
</script>

<div class="flex flex-col gap-2">
  {#if $properties.length > 0}
    <ExObjectHeaderView>Properties</ExObjectHeaderView>
  {/if}
  {#each $properties as property (property.id)}
    <PropertyView setup={property.setup} />
  {/each}
  <ExObjectButton
    on:click={onClickAddProperty}
    class={$properties.length > 0 ? "mt-2" : ""}>Add Property</ExObjectButton
  >
</div>
