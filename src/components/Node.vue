<template>
  <span class='node-root'>
    <span v-if='astNode.value != null' @click='click' :class='{ highlighted }'>{{ astNode.value }}</span>
    <span v-else-if='astNode.metaname === "Reference"' @click='click' :class='{ highlighted }'>{{ referenceToString(astNode) }}</span>
    <span v-else>
      <span @click='click' :class='["function", { highlighted }]'>{{ astNode.metaname }}(</span>
      <span v-for='(child, index) in astNode.children' :key='index'>
        <Node :astNode='child' />
        <span v-if='index !== astNode.children.length - 1'>, </span>
      </span>
      <span :class='{ highlighted }'>)</span>
    </span>
    <NodePicker
      ref='searcher'
      v-if='picking'
      :nodeToReplace="astNode"
      @blur='blur'
      @nodePicked='nodePicked'
      :class='["searcher", { "bring-to-front": picking }]'
    />
  </span>
</template>

<script>
import NodePicker from "./NodePicker";
import Actions from "../code/Actions";
import Store from '../code/Store';
import Gets from '../code/Gets';

export default {
  name: 'Node',
  components: {
    NodePicker,
  },
  props: {
    astNode: { value: 0 }
  },
  data: () => {
    return {
      store: Store,
    };
  },
  computed: {
    highlighted() {
      return this.store.cursorPosition === this.astNode;
    },
    picking() {
      return this.highlighted && this.tokenPickingInProgress;
    },
    tokenPickingInProgress() {
      return this.store.tokenPickingInProgress;
    }
  },
  methods: {
    nodePicked(metanode, makeArgs) {
      const node = Actions.replaceNode(Store, this.astNode, metanode, makeArgs);
      Actions.exitTokenPicking(Store);
      Actions.moveCursorToNode(Store, node);
      Actions.save(Store);
    },
    click() {
      Actions.moveCursorToNode(Store, this.astNode);
      Actions.exitTokenPicking(Store);
    },
    blur() {
      // Actions.blurCursor();
    },
    referenceToString(referenceNode) {
      return Gets.propertyName(Store, referenceNode.target) ?? Gets.computedPropertyName(Store, referenceNode.target);
    }
  },
  watch: {
    tokenPickingInProgress() {
      if (this.picking) {
        this.$nextTick().then(() => {
          this.$refs['searcher'].focus();
        });
      }
    },
  }
}
</script>

<style scoped>
.searcher {
  position: absolute;
  top: 100%;
}
.node-root {
  position: relative;
}
.function {
  text-transform: lowercase;
}
.highlighted {
  font-weight: bold;
}
.bring-to-front {
  z-index: 1;
}

</style>
