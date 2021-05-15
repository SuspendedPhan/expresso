<template>
  <div>
    <div>{{name}}</div>
    <div class="relative border-solid border-2 box-content" :style="nodeTreeContainerStyle">
      <WasmNode v-if="rootNode" :node="rootNode"></WasmNode>
    </div>

<!--    <canvas-->
<!--        ref="canvas"-->
<!--        type="2d"-->
<!--        :width="canvasWidth"-->
<!--        :height="canvasHeight"-->
<!--        class="canvas"-->
<!--    ></canvas>-->
  </div>
</template>

<script lang="ts">

import Component from "vue-class-component";
import {Prop, Provide, Watch} from "vue-property-decorator";
import Vue from "vue";
import WasmNode from "@/components/WasmNode.vue";
import {ElementLayout} from "@/code/ElementLayout";
import Functions from "@/code/Functions";

@Component({
  components: {WasmNode}
})
export default class WasmAttribute extends Vue {
  @Prop() attribute;

  @Provide() nodeLayout = new ElementLayout(() => this.getRootNode(), WasmNode.getChildren, WasmAttribute.getKey);

  nodeTreeContainerWidth = 0;
  nodeTreeContainerHeight = 0;

  private getRootNode() {
    return this.rootNode;
  }

  private get nodeTreeContainerStyle() {
    return `left: 0px; width: ${this.nodeTreeContainerWidth}px; height: ${this.nodeTreeContainerHeight}px`;
  }

  name = null;
  rootNode = null;
  quill = null as any;

  async mounted() {
    this.name = this.attribute.getName();
    if (this.attribute.constructor.name === 'EditableAttribute') {
      this.rootNode = this.attribute.getRootNode();
    }
    this.nodeLayout.onCalculated.subscribe(output => {
      this.nodeTreeContainerWidth = output.totalWidth;
      this.nodeTreeContainerHeight = output.totalHeight;
    });
    Vue.nextTick(() => {
      this.nodeLayout.recalculate();
    });
  }

  static getKey(node) {
    return node.getId();
  }
}

</script>
<style scoped>
</style>