<script lang="ts">
  import { ElementLayout } from "./ElementLayout";

  export let elementLayout: ElementLayout;
  let canvas;

  let lines = [];
  const treeLayoutStyle = ref("");
  elementLayout.onCalculated.subscribe((output) => {
    treeLayoutStyle.value = `left: 0px; width: ${output.totalWidth}px; height: ${output.totalHeight}px`;
    lines = output.lines;
    drawLines(canvas.value, output.lines);
  });

  const treeLayout = ref<any>(null);
  const canvasWidth = ref(0);
  const canvasHeight = ref(0);

  onMounted(() => {
    // nextTick(() => {
    //   elementLayout.recalculate();
    // });

    new ResizeSensor(treeLayout.value, () => {
      canvasWidth.value = treeLayout.value.clientWidth;
      canvasHeight.value = treeLayout.value.clientHeight;
      nextTick(() => {
        drawLines(canvas.value, lines);
      });
    });
  });

  function drawLines(canvasElement, lines) {
    const context = canvasElement.getContext("2d");
    context.strokeStyle = "gray";
    for (const line of lines) {
      context.beginPath();
      context.moveTo(line.startX, line.startY);
      context.lineTo(line.endX, line.endY);
      context.stroke();
    }
  }

  function onMounted(arg0: () => void) {
    throw new Error("Function not implemented.");
  }
</script>

<div>
  <div class="relative" ref="treeLayout" :style="treeLayoutStyle">
    <canvas
      bind:this={canvas}
      type="2d"
      :width="canvasWidth"
      :height="canvasHeight"
      class="w-full h-full absolute"
    ></canvas>
    <slot></slot>
  </div>
</div>
