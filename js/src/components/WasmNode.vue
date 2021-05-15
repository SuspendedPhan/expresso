<template>
  <div class="absolute" ref="node" :style="style">
    <div>{{text}}</div>
    <WasmNode v-for="child of children" :key='child.getId()' :node="child"></WasmNode>
  </div>
</template>

<script lang="ts">

import Component from "vue-class-component";
import {Inject, Prop} from "vue-property-decorator";
import Vue from "vue";

@Component({

})
export default class WasmNode extends Vue {
  @Prop() node;
  @Inject() nodeLayout;

  children = [] as any;
  text = ''
  position = {
    top: 0,
    left: 0,
  };

  get style() {
    return `left: ${this.position.left}px; top: ${this.position.top}px;`;
  }

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

    this.nodeLayout.registerElement(this.$refs['node'], this.node.getId());
    this.nodeLayout
        .getLocalPositionObservable(this.node.getId())
        .subscribe((localPosition) => {
          this.position.top = localPosition.top;
          this.position.left = localPosition.left;
        });

    // this.nodeLayout.recalculate();
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