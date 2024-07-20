<script lang="ts">
  import MainContext from "src/main-context/MainContext";
  import ComponentView from "./ComponentView.svelte";
  import SceneView from "src/scene/SceneView.svelte";

  export let ctx: MainContext;
  const rootComponents$ = ctx.eventBus.rootComponents$;
</script>

<div>
  <button on:click={() => ctx.componentMutator.addRootComponent()}
    >Add Component</button
  >
  {#if $rootComponents$}
    {#each $rootComponents$ as component (component.id)}
      <ComponentView {ctx} {component} />
    {/each}
  {/if}

  <SceneView {ctx} />
</div>

<style></style>
