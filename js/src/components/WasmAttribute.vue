<template>
  <div>
    <div>{{name}}</div>
    <WasmNode v-if="rootNode" :node="rootNode"></WasmNode>
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

  @Provide() nodeLayout = new ElementLayout(() => this.rootNode, WasmNode.getChildren, WasmAttribute.getKey);

  name = null;
  rootNode = null;
  quill = null as any;

  async mounted() {
    this.name = this.attribute.getName();
    if (this.attribute.constructor.name === 'EditableAttribute') {
      this.rootNode = this.attribute.getRootNode();
    }
  }

  static getKey(node) {
    return node.getId();
  }
}

</script>
<style scoped>
</style>