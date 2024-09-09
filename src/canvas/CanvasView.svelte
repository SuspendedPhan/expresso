<script lang="ts">
  import { CanvasFactory } from "src/canvas/Canvas";
  import { DexRuntime } from "src/utils/utils/DexRuntime";
  import { onMount } from "svelte";
  let viewportElement: HTMLDivElement;
  let canvasElement: HTMLCanvasElement;

  onMount(() => {
    DexRuntime.runPromise(CanvasFactory({ viewportElement, canvasElement }));
  });
</script>

<div bind:this={viewportElement} class="fixed w-full h-full">
  <canvas bind:this={canvasElement} />
</div>

<style></style>
