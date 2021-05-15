<template>
  <div>
    <div>{{text}}</div>
    <div class="pl-8">
      <WasmNode v-for="child of children" :key='child.getId()' :node="child"></WasmNode>
    </div>
  </div>
</template>

<script lang="ts">

import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import Vue from "vue";

@Component({

})
export default class WasmNode extends Vue {
  @Prop() node;

  inject = [];
  children = [] as any;
  text = ''

  async mounted() {
    const node = this.node;
    this.children = WasmNode.getChildren(node);

    if (node.constructor.name === 'AddOpNode') {
      this.text = 'Add';
    } else if (node.constructor.name === 'SubOpNode') {
      this.text = 'Sub';
    } else if (node.constructor.name === 'MulOpNode') {
      this.text = 'Mul';
    } else if (node.constructor.name === 'DivOpNode') {
      this.text = 'Div';
    } else if (node.constructor.name === 'NumberNode') {
      this.text = node.getValue();
    } else if (node.constructor.name === 'AttributeReferenceNode') {
      this.text = node.getAttribute().getName();
    }
  }

  private static getChildren(node) {
    if (node.getA) {
      const a = node.getA();
      const b = node.getB();
      return [a, b];
    } else {
      return [];
    }
  }
}

</script>
<style scoped>
</style>