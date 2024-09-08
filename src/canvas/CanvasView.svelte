<script lang="ts">
  import { Effect } from "effect";
  import { CanvasFactory } from "src/canvas/Canvas";
  import { onMount } from "svelte";
  let viewportElement: HTMLDivElement;
  let canvasElement: HTMLCanvasElement;

  onMount(() => {
    Effect.runPromise(CanvasFactory({ viewportElement, canvasElement }));
  });
</script>

<div bind:this={viewportElement} class="fixed w-full h-full">
  <canvas bind:this={canvasElement} />
</div>

<style></style>
