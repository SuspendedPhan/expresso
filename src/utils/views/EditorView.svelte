<script lang="ts">
  import MainContext from "src/main-context/MainContext";
  import RootComponentView from "./RootComponentView.svelte";

  export let ctx: MainContext;
  const rootComponents$ = ctx.eventBus.rootComponents$;
</script>

<div>
  <button on:click={() => ctx.componentMutator.addRootComponent()}
    >Add Component</button
  >
  {#if $rootComponents$}
    {#each $rootComponents$ as component (component.id)}
      <RootComponentView {ctx} {component} />
    {/each}
  {/if}
</div>

<style></style>
