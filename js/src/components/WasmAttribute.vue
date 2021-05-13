<template>
  <div>
    <div>{{ name }}</div>
    <WasmNode class='pl-8' :node="rootNode" v-if="rootNode"></WasmNode>
  </div>
</template>

<script lang="ts">

import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import Vue from "vue";
import WasmNode from "@/components/WasmNode.vue";

@Component({
  components: {WasmNode}
})
export default class WasmAttribute extends Vue {
  @Prop() attribute;

  name = null;
  rootNode = null;

  async mounted() {
    this.name = this.attribute.getName();
    window.attribute = this.attribute;
    if (this.attribute.constructor.name === 'EditableAttribute') {
      this.rootNode = this.attribute.getRootNode();
    }
  }
}

</script>
<style scoped>
</style>