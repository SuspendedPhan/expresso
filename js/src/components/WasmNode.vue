<template>
  <div>
    <div>{{text}}</div>
    <div class="pl-8">
      <WasmNode v-for="child of children" :key='child' :node="child"></WasmNode>
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

  children = [];
  text = ''

  async mounted() {
    if (this.node.getA) {
      const a = this.node.getA();
      const b = this.node.getB();
      this.children = [a, b];
    }

    if (this.node.constructor.name === 'AddOpNode') {
      this.text = 'Add';
    } else if (this.node.constructor.name === 'SubOpNode') {
      this.text = 'Sub';
    } else if (this.node.constructor.name === 'MulOpNode') {
      this.text = 'Mul';
    } else if (this.node.constructor.name === 'DivOpNode') {
      this.text = 'Div';
    } else if (this.node.constructor.name === 'NumberNode') {
      this.text = this.node.getValue();
    } else if (this.node.constructor.name === 'AttributeReferenceNode') {
      this.text = this.node.getAttribute().getName();
    }
  }
}

</script>
<style scoped>
</style>