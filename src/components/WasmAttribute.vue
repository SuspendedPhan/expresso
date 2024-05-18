<template>
  <div>
    <div>{{name}}</div>
    <TreeLayout :elementLayout="nodeLayout">
      <WasmNode v-if="rootNode" :node="rootNode" :key="rootNodeId"></WasmNode>
    </TreeLayout>
  </div>
</template>

<script lang="ts">

import Component from "vue-class-component";
import {Prop, Provide, Watch} from "vue-property-decorator";
import Vue from "vue";
import WasmNode from "@/components/WasmNode.vue";
import {ElementLayout} from "@/code/ElementLayout";
import TreeLayout from "@/components/TreeLayout.vue";
import Store from "@/models/Store";

@Component({
  components: {TreeLayout, WasmNode}
})
export default class WasmAttribute extends Vue {
  @Prop() attribute;

  @Provide() nodeLayout = new ElementLayout(() => this.getRootNode(), node => Store.getChildren(node), WasmAttribute.getKey, horizontalMargin, verticalMargin);

  name = null;
  rootNode = null;
  rootNodeId = null;

  async mounted() {
    this.name = this.attribute.getName();
    if (this.attribute.constructor.name === 'EditableAttribute') {
      this.rootNode = this.attribute.getRootNode();
      (window as any).wasmModule.EmbindUtil.setSignalListener(this.attribute.getOnChangedSignal(), () => this.onRootNodeChanged());
    }
  }

  private getRootNode() {
    return this.rootNode;
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
}

</script>
