<script lang="ts">
  import { ResizeSensor } from "css-element-queries";
  import MainContext from "src/main-context/MainContext";
  import { onMount } from "svelte";
  import RootComponentView from "./RootComponentView.svelte";

  export let ctx: MainContext;
  const rootComponents$ = ctx.eventBus.rootComponents$;

  let rootElement: HTMLElement;

  onMount(() => {
    const sensor = new ResizeSensor(rootElement, ({ width }) => {
      ctx.viewCtx.editorViewWidth$.next(width);
    });
    return () => {
      sensor.detach();
    };
  });
</script>

<div
  class="p-8 flex flex-col items-center overflow-scroll"
  bind:this={rootElement}
>
  <div class="flex gap-4">
    <button on:click={() => ctx.projectMutator.addRootComponent()} class="btn"
      >Add Component</button
    >
    <button on:click={() => ctx.projectMutator.newProject()} class="btn"
      >New Project</button
    >
  </div>
  <div class="grid grid-flow-row">
    {#if $rootComponents$}
      {#each $rootComponents$ as component (component.id)}
        <div class="divider"></div>
        <RootComponentView {ctx} {component} />
      {/each}
    {/if}
  </div>
</div>

<style></style>
