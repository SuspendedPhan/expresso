<script lang="ts">
  import { onMount, tick } from "svelte";
  import { ElementLayout } from "./ElementLayout";
  import ResizeSensor from "css-element-queries/src/ResizeSensor";
  import type { Line } from "src/utils/layout/Layout";
  import MainContext from "src/main-context/MainContext";
  import { first } from "rxjs";

  export let elementLayout: ElementLayout;
  export let ctx: MainContext;
  let canvas: HTMLCanvasElement;

  let lines: Line[] = [];
  let treeLayoutStyle: string;
  let rootElement: HTMLElement;
  let canvasWidth: number;
  let canvasHeight: number;
  let xTranslation = 0;

  elementLayout.onCalculated.subscribe((output) => {
    treeLayoutStyle = `left: 0px; width: ${output.totalWidth}px; height: ${output.totalHeight}px`;
    lines = output.lines;
    drawLines(canvas, output.lines);

    // ctx.viewCtx.editorViewWidth$.pipe(first()).subscribe((width) => {
    //   xTranslation = output.totalWidth / 2 - width / 2;
    // });
  });

  onMount(() => {
    new ResizeSensor(rootElement, () => {
      canvasWidth = rootElement.clientWidth;
      canvasHeight = rootElement.clientHeight;
      drawLines(canvas, lines);
      tick().then(() => {
        drawLines(canvas, lines);
      });
    });
  });

  function drawLines(canvasElement: HTMLCanvasElement, lines: Line[]) {
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

<div
  class="relative"
  bind:this={rootElement}
  style={treeLayoutStyle}
  style:transform="translateX({xTranslation}px)"
>
  <canvas
    bind:this={canvas}
    width={canvasWidth}
    height={canvasHeight}
    class="w-full h-full absolute"
  ></canvas>
  <slot></slot>
</div>
