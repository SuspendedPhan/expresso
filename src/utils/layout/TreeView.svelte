<script lang="ts">
  import ResizeSensor from "css-element-queries/src/ResizeSensor";
  import MainContext from "src/main-context/MainContext";
  import type { Line } from "src/utils/layout/Layout";
  import { log5 } from "src/utils/utils/Log3";
  import { onMount, tick } from "svelte";
  import { ElementLayout } from "./ElementLayout";

  const log55 = log5("TreeView.svelte");

  export let elementLayout: ElementLayout;
  export let ctx: MainContext;
  const debugCtx = structuredClone(ctx.debugCtx);
  let canvas: HTMLCanvasElement;

  let lines: Line[] = [];
  let treeLayoutStyle: string;
  let rootElement: HTMLElement;
  let canvasWidth: number;
  let canvasHeight: number;

  // RxFns.onMount$()
  //   .pipe(switchMap(() => elementLayout.onCalculated))
  //   .subscribe((output) => {
  //     console.log(debugCtx);

  //     treeLayoutStyle = `left: 0px; width: ${output.totalWidth}px; height: ${output.totalHeight}px`;
  //     lines = output.lines;
  //     drawLines(canvas, output.lines);
  //   });

  onMount(() => {
    console.log("canvas", canvas);

    elementLayout.onCalculated.subscribe((output) => {
      treeLayoutStyle = `left: 0px; width: ${output.totalWidth}px; height: ${output.totalHeight}px`;
      lines = output.lines;
      drawLines(canvas, output.lines);
    });

    new ResizeSensor(rootElement, () => {
      canvasWidth = rootElement.clientWidth;
      canvasHeight = rootElement.clientHeight;

      drawLines(canvas, lines);
      tick().then(() => {
        drawLines(canvas, lines);
      });

      log55.debug(debugCtx);
      log55.debug("canvasWidth", canvasWidth);
      log55.debug("canvasHeight", canvasHeight);
    });
  });

  function drawLines(canvasElement: HTMLCanvasElement, lines: Line[]) {
    console.log(debugCtx);
    const context = canvasElement.getContext("2d");
    if (!context) {
      throw new Error("Could not get 2d context");
    }
    context.strokeStyle = "gray";
    for (const line of lines) {
      context.beginPath();
      context.moveTo(line.startX, line.startY);
      context.lineTo(line.endX, line.endY);
      context.stroke();
    }
  }
</script>

<div class="relative w-max" bind:this={rootElement} style={treeLayoutStyle}>
  <canvas
    bind:this={canvas}
    width={canvasWidth}
    height={canvasHeight}
    class="w-full h-full absolute"
  ></canvas>
  <slot></slot>
</div>
