<script lang="ts">
  import MainContext from "src/main-context/MainContext";
  import ComponentView from "./ComponentView.svelte";
  import SceneView from "src/scene/SceneView.svelte";

  export let ctx: MainContext;
  const rootComponents$ = ctx.eventBus.rootComponents$;
</script>

<div>
  {#each $rootComponents$ as component (component.id)}
    <ComponentView {ctx} {component} />
  {/each}

  <SceneView {ctx} />
</div>

<style></style>
