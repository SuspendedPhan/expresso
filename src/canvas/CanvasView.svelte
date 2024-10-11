<script lang="ts">
  import { Scope } from "effect";
  import { dexMakeSvelteScope, DexRuntime } from "src/utils/utils/DexRuntime";
  import { CanvasViewCtx } from "./CanvasView";
  let viewportElement: HTMLDivElement;
  let canvasElement: HTMLCanvasElement;

  dexMakeSvelteScope().then((scope) =>
    CanvasViewCtx.setup(viewportElement, canvasElement).pipe(
      Scope.extend(scope),
      DexRuntime.runPromise
    )
  );
</script>

<div bind:this={viewportElement} class=" h-full">
  <canvas bind:this={canvasElement} />
</div>

<style></style>
