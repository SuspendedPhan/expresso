<script lang="ts">
  import { onMount } from "svelte";
  import { CanvasMain } from "./CanvasMain";
  import PixiFactory from "./PixiFactory";
  import MainContext from "src/main-context/MainContext";
  export let ctx: MainContext;
  let viewportElement: HTMLDivElement;
  let canvasElement: HTMLCanvasElement;

  onMount(() => {
    const pixiFactory = new PixiFactory(viewportElement, canvasElement);
    new CanvasMain(ctx, pixiFactory);
  });
</script>

<div bind:this={viewportElement} class="fixed w-full h-full">
  <canvas bind:this={canvasElement} />
</div>

<style></style>
