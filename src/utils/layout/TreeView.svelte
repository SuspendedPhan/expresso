<script lang="ts">
  import { switchMap } from "rxjs";

  import type { Line } from "src/utils/layout/Layout";
  import { log5 } from "src/utils/utils/Log5";
  import { RxFns } from "src/utils/utils/Utils";
  import { onMount, tick } from "svelte";
  import { ElementLayout } from "./ElementLayout";
  import { ResizeSensor } from "css-element-queries";
  import { setTime } from "effect/TestClock";

  const log55 = log5("TreeView.svelte");
  log55.debug("TreeView.svelte init");

  export let elementLayout: ElementLayout;

  let canvas: HTMLCanvasElement;

  let lines: Line[] = [];
  let treeLayoutStyle: string;
  let rootElement: HTMLElement;
  let canvasWidth: number;
  let canvasHeight: number;

  RxFns.onMount$()
    .pipe(switchMap(() => elementLayout.onCalculated))
    .subscribe((output) => {
      treeLayoutStyle = `left: 0px; width: ${output.totalWidth}px; height: ${output.totalHeight}px`;
      lines = output.lines;
      drawLines(canvas, output.lines);
    });

  // RxFns.onMount$()
  //   .pipe(switchMap(() => RxFns.resizeSensor$(rootElement)))
  //   .subscribe(() => {
  //     setTimeout(() => {
  //       canvasWidth = rootElement.clientWidth;
  //       canvasHeight = rootElement.clientHeight;
  //       log55.debug2("canvasWidth2", canvasWidth);
  //       log55.debug2("canvasHeight2", canvasHeight);

  //       setTimeout(() => {
  //         drawLines(canvas, lines);
  //       }, 100);
  //     }, 100);
  //   });

  onMount(() => {
    new ResizeSensor(rootElement, () => {
      setTimeout(() => {
        canvasWidth = rootElement.clientWidth;
        canvasHeight = rootElement.clientHeight;

        if (canvasWidth > 100) {
          log55.debug2(`canvas size: ${canvasWidth}x${canvasHeight}`);
        }

        setTimeout(() => {
          drawLines(canvas, lines);
        }, 100);
      }, 1000);
    });
  });

  function drawLines(canvasElement: HTMLCanvasElement, lines: Line[]) {
    if (lines.length === 0) {
      return;
    }
    log55.debug("drawLines", lines);

    const context = canvasElement.getContext("2d");
    if (!context) {
      throw new Error("Could not get 2d context");
    }
    context.clearRect(0, 0, canvasElement.width, canvasElement.height);
    for (const line of lines) {
      context.beginPath();
      context.strokeStyle = "gray";
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
