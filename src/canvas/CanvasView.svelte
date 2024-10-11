<script lang="ts">
  import { Effect, Ref } from "effect";
  import { CanvasFactory } from "src/canvas/Canvas";
  import { GlobalPropertyCtx } from "src/ex-object/GlobalProperty";
  import { DexRuntime } from "src/utils/utils/DexRuntime";
  import { onMount } from "svelte";
  import { assert } from "assert-ts";
  let viewportElement: HTMLDivElement;
  let canvasElement: HTMLCanvasElement;

  onMount(() => {
    Effect.gen(function* () {
      yield* CanvasFactory({ viewportElement, canvasElement });
      const globalPropertyCtx = yield* GlobalPropertyCtx;
      yield* Ref.set(globalPropertyCtx.canvasWidth, canvasElement.width);
      yield* Ref.set(globalPropertyCtx.canvasHeight, canvasElement.height);

      new ResizeObserver((entries) => {
        Effect.gen(function* () {
          assert(entries.length === 1);
          const entry = entries[0];
          if (entry) {
            const { width, height } = entry.contentRect;
            console.log("width", width);
            console.log("height", height);
            yield* Ref.set(globalPropertyCtx.canvasWidth, width);
            yield* Ref.set(globalPropertyCtx.canvasHeight, height);
            canvasElement.width = width;
            canvasElement.height = height;
          }
        }).pipe(DexRuntime.runPromise);
      }).observe(viewportElement);
    }).pipe(DexRuntime.runPromise);
  });
</script>

<div bind:this={viewportElement} class=" h-full">
  <canvas bind:this={canvasElement} />
</div>

<style></style>
