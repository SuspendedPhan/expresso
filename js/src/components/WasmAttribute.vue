<template>
  <div>
    <div>{{name}}</div>
    <div class="relative border-solid border-2 box-content" ref="nodeTreeContainer" :style="nodeTreeContainerStyle">
      <canvas
          ref="canvas"
          type="2d"
          :width="canvasWidth"
          :height="canvasHeight"
          class="w-full h-full absolute"
      ></canvas>
      <WasmNode v-if="rootNode" :node="rootNode" :key="rootNodeId"></WasmNode>
    </div>
  </div>
</template>

<script lang="ts">

import Component from "vue-class-component";
import {Prop, Provide, Watch} from "vue-property-decorator";
import Vue from "vue";
import WasmNode from "@/components/WasmNode.vue";
import {ElementLayout} from "@/code/ElementLayout";
import Functions from "@/code/Functions";
import ResizeSensor from "css-element-queries/src/ResizeSensor";

@Component({
  components: {WasmNode}
})
export default class WasmAttribute extends Vue {
  @Prop() attribute;

  @Provide() nodeLayout = new ElementLayout(() => this.getRootNode(), WasmNode.getChildren, WasmAttribute.getKey);

  nodeTreeContainerWidth = 0;
  nodeTreeContainerHeight = 0;
  name = null;
  rootNode = null;
  rootNodeId = null;
  quill = null as any;
  canvasWidth = 0;
  canvasHeight = 0;
  lines;

  $refs;

  async mounted() {
    this.name = this.attribute.getName();
    if (this.attribute.constructor.name === 'EditableAttribute') {
      this.rootNode = this.attribute.getRootNode();
      window.wasmModule.EmbindUtil.setSignalListener(this.attribute.getOnChangedSignal(), () => this.onRootNodeChanged());
    }
    this.nodeLayout.onCalculated.subscribe(output => {
      this.nodeTreeContainerWidth = output.totalWidth;
      this.nodeTreeContainerHeight = output.totalHeight;
      this.lines = output.lines;
      this.drawLines(output.lines);
    });
    Vue.nextTick(() => {
      this.nodeLayout.recalculate();
    });

    new ResizeSensor(this.$refs["nodeTreeContainer"], () => {
      this.canvasWidth = this.$refs["nodeTreeContainer"].clientWidth;
      this.canvasHeight = this.$refs["nodeTreeContainer"].clientHeight;
      this.$nextTick(() => {
        this.drawLines(this.lines);
      });
    });
  }

  private getRootNode() {
    return this.rootNode;
  }

  private get nodeTreeContainerStyle() {
    return `left: 0px; width: ${this.nodeTreeContainerWidth}px; height: ${this.nodeTreeContainerHeight}px`;
  }

  private onRootNodeChanged() {
    const rootNode = this.attribute.getRootNode();
    this.rootNode = rootNode;
    this.rootNodeId = rootNode.getId();
    this.$nextTick(() => {
      this.nodeLayout.recalculate();
    });
  }

  static getKey(node) {
    return node.getId();
  }

  private drawLines(lines) {
    const context = this.$refs["canvas"].getContext("2d");
    context.strokeStyle = "gray";
    for (const line of lines) {
      context.beginPath();
      context.moveTo(line.startX, line.startY);
      context.lineTo(line.endX, line.endY);
      context.stroke();
    }
  }
}

</script>
<style scoped>
</style>