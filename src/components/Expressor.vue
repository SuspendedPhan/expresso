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
      <Organism :organism="root.organismCollection.getRoot()" :isRoot="true" />
      <div class="bottom-group">
        <button @click="clearStorage">Clear storage</button>
        <div :class="['error-box', { error: consoleError }]">
          you have console errors
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { PenPositionRelation } from "@/store/Pen";
import wu from "wu";
import Root from "../store/Root";
import Node from "./Node";
import Organism from "./Organism";
import Vue from "vue";
import panzoom from "panzoom";
import ResizeSensor from "css-element-queries/src/ResizeSensor";

export default {
  name: "Expressor",
  components: {
    // Node,
    Organism,
  },
  props: {},
  data: function () {
    return {
      root: Root,
      attributeStore: Root.attributeStore,
      metaorganismCollection: Root.metaorganismCollection,
      selectedPrimitiveId: Root.metaorganismCollection.getMetaorganisms()[0].id,
      consoleError: false,
      canvasWidth: 0,
      canvasHeight: 0,
      panzoomTransform: {},
      lines: [],
    };
  },
  computed: {},
  methods: {
    getNodeForAttribute: function (attribute) {
      return Root.nodeStore.getChild(
        Root.attributeStore.getRootNode(attribute),
        0
      );
    },
    spawn: function () {
      const metaorganism = this.metaorganismCollection.getFromId(
        this.selectedPrimitiveId
      );
      this.root.organismCollection.putFromMeta(undefined, metaorganism);
      this.root.save();
    },
    clearStorage: function () {
      this.root.clearStorage();
    },
    removeOrganism: function (organism) {
      this.root.organismCollection.remove(organism);
      this.root.save();
    },
    drawLines: function () {
      const context = this.$refs["canvas"].getContext("2d");
      context.resetTransform();
      context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      const transform = this.panzoomTransform;
      context.setTransform(
        transform.scale,
        0,
        0,
        transform.scale,
        transform.x,
        transform.y
      );
      context.strokeStyle = "gray";
      for (const line of this.lines) {
        context.beginPath();
        context.moveTo(line.startX, line.startY);
        context.lineTo(line.endX, line.endY);
        context.stroke();
      }
    },
  },
  mounted() {
    const pz = panzoom(this.$refs["panzoom"], {
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
    this.canvasWidth = this.$refs["expressor"].clientWidth;
    this.canvasHeight = this.$refs["expressor"].clientHeight;

    new ResizeSensor(this.$refs["expressor"], () => {
      this.canvasWidth = this.$refs["expressor"].clientWidth;
      this.canvasHeight = this.$refs["expressor"].clientHeight;
    });

    this.root.organismLayout.onLinesCalculated.subscribe((lines) => {
      this.lines = lines;
      this.drawLines();
    });
  },
};
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
</style>
