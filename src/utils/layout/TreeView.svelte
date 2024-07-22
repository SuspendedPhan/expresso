<script lang="ts">
  import { onMount, tick } from "svelte";
  import { ElementLayout } from "./ElementLayout";
  import ResizeSensor from "css-element-queries/src/ResizeSensor";
  import type { Line } from "src/utils/layout/Layout";

  export let elementLayout: ElementLayout;
  let canvas: HTMLCanvasElement;

  let lines: Line[] = [];
  let treeLayoutStyle: string;
  let treeLayout: HTMLElement;
  let canvasWidth: number;
  let canvasHeight: number;
  let xTranslation = 0;

  elementLayout.onCalculated.subscribe((output) => {
    treeLayoutStyle = `left: 0px; width: ${output.totalWidth}px; height: ${output.totalHeight}px`;
    lines = output.lines;
    drawLines(canvas, output.lines);

    let leftMost = 0;
    for (const position of output.localPositionsByKey.values()) {
      if (position.left < 0 && position.left < leftMost) {
        leftMost = position.left;
      }
    }
    xTranslation = -leftMost / 2;
  });

  onMount(() => {
    new ResizeSensor(treeLayout, () => {
      canvasWidth = treeLayout.clientWidth;
      canvasHeight = treeLayout.clientHeight;
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

<div>
  <div
    class="relative"
    bind:this={treeLayout}
    style={treeLayoutStyle}
    style:transform="translateX({xTranslation}px)"
  >
    <canvas
      bind:this={canvas}
      type="2d"
      width={canvasWidth}
      height={canvasHeight}
      class="w-full h-full absolute"
    ></canvas>
    <slot></slot>
  </div>
</div>
