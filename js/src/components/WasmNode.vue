<template>
  <div class="absolute" ref="node" :style="style">
    <div :class="['border', 'border-black', {'border-opacity-0': !selected}]">
      <div class='bg-white' @click="onClick">{{ text }}</div>
      <Searchbox v-if="searchboxActive" ref='searchbox' :choices="nodeChoices" :query='searchboxQuery'
                 @blur="onSearchboxBlur" @queryInput="onSearchboxQueryInput"
                 @choiceCommitted="onSearchboxChoiceCommitted"></Searchbox>
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
  nodeChoices = [];
  searchboxActive = false;
  selected = false;
  onKeydownFunction;
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
      this.text = node.getReferenceRaw().getName();
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

    this.onKeydownFunction = event => this.onKeydown(event);

    // Set timeout, otherwise node replacement will get the enter key right away.
    window.setTimeout(() => {
      document.addEventListener('keydown', this.onKeydownFunction);
    }, 50);

    // We expect the node we replaced to set the pen's selected node to be our node
    const selected = this.node.getId() === this.pen.getSelectedNode()?.getId();
    if (selected) {
        this.selected = true;
    }
  }

  private onKeydown(event) {
    if (!this.selected) return;

    if (event.key === 'Enter') {
      this.searchboxActive = true;
      this.$nextTick(() => {
        (this.$refs['searchbox'] as any).focus();
      });
    } else if (event.key === 'ArrowUp') {
      const parentRaw = this.node.getParentRaw();
      if (parentRaw !== null) {
        this.pen.setSelectedNode(parentRaw);
      }
    } else if (event.key === 'ArrowDown') {
      const children = WasmNode.getChildren(this.node);
      if (children.length > 0) {
        this.pen.setSelectedNode(children[0]);
      }
    } else if (event.key === 'ArrowLeft') {
      const parentRaw = this.node.getParentRaw();
      if (WasmNode.isBinaryOpNode(parentRaw)) {
        this.pen.setSelectedNode(WasmNode.getOtherBinaryOpSibling(parentRaw, this.node));
      }
    } else if (event.key === 'ArrowRight') {
      const parentRaw = this.node.getParentRaw();
      if (WasmNode.isBinaryOpNode(parentRaw)) {
        this.pen.setSelectedNode(WasmNode.getOtherBinaryOpSibling(parentRaw, this.node));
      }
    }
  }

  destroyed() {
    document.removeEventListener('keydown', this.onKeydownFunction);
    this.localLayoutPositionSubscription.unsubscribe();
  }

  private onClick() {
    this.pen.setSelectedNode(this.node);
    this.selected = true;
    this.nodeChoices = WasmPen.getNodeChoices(this.node, this.searchboxQuery);
  }

  private onSearchboxQueryInput(query) {
    this.searchboxQuery = query;
    this.nodeChoices = WasmPen.getNodeChoices(this.node, this.searchboxQuery);
  }

  private onSearchboxBlur() {
    this.searchboxActive = false;
  }

  private onSearchboxChoiceCommitted(choice) {
    const newNode = choice.nodeMakerFunction();
    this.node.replace(newNode);
    this.pen.setSelectedNode(newNode);
  }

  private onSelectedNodeChanged() {
    if (this.pen.selectedNode?.getId() === this.node.getId()) {
      this.selected = true;
    } else {
      this.selected = false;
      this.searchboxActive = false;
      this.nodeChoices = [];
    }
  }

  private onNodeChanged() {
    console.log("chagned");
    this.children = WasmNode.getChildren(this.node);
    this.$nextTick(() => this.nodeLayout.recalculate());
  }

  private static getChildren(node) {
    if (node.isBinaryOpNode) {
      const a = node.isBinaryOpNode();
      const b = node.getB();
      return [a, b];
    } else {
      return [];
    }
  }

  private static isBinaryOpNode(parentRaw) {
    const answer = parentRaw.getA !== undefined;
    console.log(parentRaw.getA);
    console.log(answer);
    return answer;
  }

  private static getOtherBinaryOpSibling(binaryOpParent, node) {
    const rawA = binaryOpParent.getA();
    const rawB = binaryOpParent.getB();
    if (node.getId() === rawA.getId()) {
      return rawB;
    } else {
      return rawA;
    }
  }
}

</script>
<style scoped>
</style>