<template>
  <div class="absolute" ref="node" :style="style" @keydown="onKeydown">
    <div :class="{ border: selected }">
      <div @click="onClick" @keydown="onKeydown">{{ text }}</div>
      <Searchbox v-if="searchboxActive" :choices="nodeChoices" @blur="onSearchboxBlur"></Searchbox>
    </div>
    <WasmNode v-for="child of children" :key='child.getId()' :node="child"></WasmNode>
  </div>
</template>

<script lang="ts">

import Component from "vue-class-component";
import {Inject, Prop} from "vue-property-decorator";
import Vue from "vue";
import Searchbox from "@/components/Searchbox.vue";
import doc = Mocha.reporters.doc;

@Component({
  components: {Searchbox}
})
export default class WasmNode extends Vue {
  @Prop() node;
  @Inject() nodeLayout;
  @Inject() pen;

  children = [] as any;
  text = ''
  position = {
    top: 0,
    left: 0,
  };
  nodeChoices = [{text: 'sdf'}];
  searchboxActive = false;
  selected = false;
  onKeydown;

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
    } else if (node.constructor.name === 'ModOpNode') {
      this.text = 'Mod';
    } else if (node.constructor.name === 'NumberNode') {
      this.text = node.getValue();
    } else if (node.constructor.name === 'AttributeReferenceNode') {
      this.text = node.getAttribute().getName();
    } else {
      console.error(node.constructor.name);
    }

    this.nodeLayout.registerElement(this.$refs['node'], this.node.getId());
    this.nodeLayout
        .getLocalPositionObservable(this.node.getId())
        .subscribe((localPosition) => {
          this.position.top = localPosition.top;
          this.position.left = localPosition.left;
        });
    this.pen.onSelectedNodeChanged.sub(() => this.onSelectedNodeChanged());

    this.onKeydown = event => {
      if (!this.selected) return;

      if (event.key === 'Enter') {
        this.searchboxActive = true;
      }
    };
    document.addEventListener('keydown', this.onKeydown);
  }

  destroyed() {
    document.removeEventListener('keydown', this.onKeydown);
  }

  private onClick() {
    this.pen.setSelectedNode(this.node);
    this.selected = true;
  }

  private onSearchboxBlur() {
    this.searchboxActive = false;
  }

  private onSelectedNodeChanged() {
    if (this.pen.selectedNode !== this.node) {
      this.selected = false;
      this.searchboxActive = false;
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