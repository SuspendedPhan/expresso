<template>
  <div class="absolute" ref="node" :style="style">
    <div :class="{ border: selected }">
      <div @click="onClick">{{ text }}</div>
      <Searchbox v-if="searchboxActive" :choices="nodeChoices" :query='searchboxQuery' @blur="onSearchboxBlur" @queryInput="onSearchboxQueryInput" @choiceCommitted="onSearchboxChoiceCommitted"></Searchbox>
    </div>
    <WasmNode v-for="child of children" :key='child.getId()' :node="child"></WasmNode>
  </div>
</template>

<script lang="ts">

import Component from "vue-class-component";
import {Inject, Prop} from "vue-property-decorator";
import Vue from "vue";
import Searchbox from "@/components/Searchbox.vue";
import WasmPen from "@/code/WasmPen";
import {Subscription} from "rxjs";

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
  searchboxQuery = '';
  localLayoutPositionSubscription!: Subscription;

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

    window.wasmModule.EmbindUtil.setSignalListener(node.getOnChangedSignal(), () => this.onNodeChanged());

    this.nodeLayout.registerElement(this.$refs['node'], this.node.getId());
    this.localLayoutPositionSubscription = this.nodeLayout
        .getLocalPositionObservable(this.node.getId())
        .subscribe((localPosition) => {
          if (localPosition === undefined) return;
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
    this.localLayoutPositionSubscription.unsubscribe();
    console.log("destroyed");
  }

  private onClick() {
    this.pen.setSelectedNode(this.node);
    this.selected = true;
    this.nodeChoices = WasmPen.getNodeChoices(this.node, this.searchboxQuery);
  }

  private onSearchboxQueryInput(query) {
    console.log(this.searchboxQuery);
    this.searchboxQuery = query;
    this.nodeChoices = WasmPen.getNodeChoices(this.node, this.searchboxQuery);
  }

  private onSearchboxBlur() {
    this.searchboxActive = false;
  }

  private onSearchboxChoiceCommitted(choice) {
    this.node.replace(choice.nodeMakerFunction());
  }

  private onSelectedNodeChanged() {
    if (this.pen.selectedNode !== this.node) {
      this.selected = false;
      this.searchboxActive = false;
      this.nodeChoices = [];
    }
  }

  private onNodeChanged() {
    this.children = WasmNode.getChildren(this.node);
    this.$nextTick(() => this.nodeLayout.recalculate());
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