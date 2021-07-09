<template>
  <div class="expressor" ref="expressor">
    <canvas
        ref="canvas"
        type="2d"
        :width="canvasWidth"
        :height="canvasHeight"
        class="canvas"
    ></canvas>
    <div ref="panzoom">
      <WasmOrganism v-if="rootOrganism" :organism="rootOrganism" :organismLayout="organismLayout" :isRoot="true"></WasmOrganism>
<!--      <div class="bottom-group">-->
<!--        <button @click="clearStorage" class="clearStorage">-->
<!--          Clear storage-->
<!--        </button>-->
<!--        <div :class="['error-box', { error: consoleError }]">-->
<!--          you have console errors-->
<!--        </div>-->
<!--      </div>-->
    </div>
  </div>
</template>

<script lang="ts">

import Component from "vue-class-component";
import {Prop, Provide} from "vue-property-decorator";
import Vue from "vue";
import WasmOrganism from "@/components/WasmOrganism.vue";
import {ElementLayout} from "@/code/ElementLayout";
import Functions from "@/code/Functions";

import panzoom from "panzoom";
import ResizeSensor from "css-element-queries/src/ResizeSensor";
import WasmPen from "@/code/WasmPen";

@Component({
  components: {WasmOrganism}
})
export default class WasmExpressor extends Vue {
  @Prop()
  project;

  rootOrganism = null;
  organismLayout = null as any;

  consoleError = false;
  canvasWidth = 0;
  canvasHeight = 0;
  panzoomTransform = {};
  lines = [];

  async mounted() {
    this.rootOrganism = this.project.getRootOrganism();
    this.organismLayout = new ElementLayout(() => this.rootOrganism, WasmExpressor.getChildren, WasmExpressor.getKey);
    this.oldMounted();
  }

  private static getChildren(organism) {
    return Functions.vectorToArray(organism.getSuborganisms());
  }

  private static getKey(organism) {
    return organism.getId();
  }

  // --- old stuff ---

  oldMounted() {
    const pz = panzoom(this.$refs["panzoom"] as any, {
      beforeMouseDown: function (e) {
        var shouldIgnore = !e.altKey;
        return shouldIgnore;
      },
      filterKey: function (/* e, dx, dy, dz */) {
        // don't let panzoom handle this event:
        return true;
      },
      zoomDoubleClickSpeed: 1,
    });
    pz.on("transform", (e) => {
      this.panzoomTransform = pz.getTransform();
      this.drawLines();
    });

    // NOTE: maybe can remove?
    const expressorElement = this.$refs["expressor"] as any;
    this.canvasWidth = expressorElement.clientWidth;
    this.canvasHeight = expressorElement.clientHeight;

    new ResizeSensor(expressorElement as any, () => {
      this.canvasWidth = expressorElement.clientWidth;
      this.canvasHeight = expressorElement.clientHeight;
    });

    this.organismLayout.onCalculated.subscribe((output) => {
      this.lines = output.lines;
      this.drawLines();
    });
  }

  // clearStorage() {
  //   this.root.clearStorage();
  // }

  drawLines() {
    const canvasElement = this.$refs["canvas"] as any;
    const context = canvasElement.getContext("2d");
    context.resetTransform();
    context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    const transform = this.panzoomTransform as any;
    context.setTransform(
        transform.scale,
        0,
        0,
        transform.scale,
        transform.x,
        transform.y
    );
    context.strokeStyle = "gray";
    for (const line of this.lines as any) {
      context.beginPath();
      context.moveTo(line.startX, line.startY);
      context.lineTo(line.endX, line.endY);
      context.stroke();
    }
  }
}

</script>
<style scoped>
.expressor {
  position: relative;
  outline: none;
}
.organism {
  margin-bottom: 20px;
}
.attribute {
}
.controls {
  display: grid;
  grid-template-columns: max-content max-content max-content;
  gap: 10px;
}
.bottom-group {
  display: flex;
  justify-content: space-between;
}
.error-box {
  padding: 5px;
  font-size: 12px;
  background-color: hsl(0, 100%, 67%);
  visibility: hidden;
  color: white;
}
.error-box.error {
  visibility: visible;
}
.canvas {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0px;
  left: 0px;
  border: none;
}
.clearStorage {
  position: fixed;
  top: 10px;
  left: 200px;
  z-index: 2;
}
</style>