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
import Store from "@/models/Store";

@Component({
  components: {Searchbox}
})
export default class WasmNode extends Vue {
  @Prop() node;
  @Inject() nodeLayout;
  @Inject() pen;
  @Inject() saveStoreFunctor;

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
    } else if (node.constructor.name === 'FunctionCallNode') {
      this.text = node.getName();
    } else if (node.constructor.name === 'ParameterNode') {
      this.text = node.getFunctionParameter().getName();
    } else {
      console.error(node.constructor.name);
    }

    (window as any).wasmModule.EmbindUtil.setSignalListener(node.getOnChangedSignal(), () => this.onNodeChanged());

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
    }, 0);

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
    } else {
      this.onKeydownArrows(event);
    }
  }

  private onKeydownArrows(event) {
    if (this.node.getParent() === null) {
      console.error('onkeydown get parent null');
      return;
    }

    const parent = this.node.getParent();
    if (parent.isNode()) {
      this.onKeydownDown(event);
      const parentNode = parent.getNode();
      if (event.key === 'ArrowUp') {
        window.setTimeout(() => this.pen.setSelectedNode(parentNode), 0);
      } else if (event.key === 'ArrowLeft') {
        if (WasmNode.isBinaryOpNode(parentNode)) {
          window.setTimeout(() => this.pen.setSelectedNode(WasmNode.getOtherBinaryOpSibling(parentNode, this.node)), 0);
        }
      } else if (event.key === 'ArrowRight') {
        if (WasmNode.isBinaryOpNode(parentNode)) {
          window.setTimeout(() => this.pen.setSelectedNode(WasmNode.getOtherBinaryOpSibling(parentNode, this.node)), 0);
        }
      }
    } else if (parent.isAttribute()) {
      this.onKeydownDown(event);
    }
  }

  private onKeydownDown(event) {
    if (event.key === 'ArrowDown') {
      const children = WasmNode.getChildren(this.node);
      if (children.length > 0) {
        window.setTimeout(() => this.pen.setSelectedNode(children[0]), 0);
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
    this.saveStoreFunctor();
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
    this.children = WasmNode.getChildren(this.node);
    this.$nextTick(() => this.nodeLayout.recalculate());
  }

  public static getChildren(node) {
    return Store.getChildren(node);
  }

  private static isBinaryOpNode(parentRaw) {
    return Store.isBinaryOpNode(parentRaw);
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