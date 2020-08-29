<template>
  <span class='node-root'>
    <span v-if='astNode.value != null' @click='click' :class='{ picking }'>{{ astNode.value }}</span>
    <span v-else-if='astNode.metaname === "Reference"' @click='click' :class='{ picking }'>{{ referenceToString(astNode) }}</span>
    <span v-else>
      <span @click='click' :class='["function", { picking }]'>{{ astNode.metaname }}(</span>
      <span v-for='(child, index) in astNode.children' :key='index'>
        <Node :astNode='child' />
        <span v-if='index !== astNode.children.length - 1'>, </span>
      </span>
      <span :class='{ picking }'>)</span>
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
      picking: false,
    };
  },
  methods: {
    nodePicked(metanode, makeArgs) {
      Actions.replaceNode(Store, this.astNode, metanode, makeArgs);
    },
    click() {
      this.picking = true;
      this.$nextTick().then(() => {
        this.$refs['searcher'].focus();
      });
    },
    blur() {
      this.picking = false;
    },
    referenceToString(referenceNode) {
      return Gets.propertyName(Store, referenceNode.target) ?? Gets.computedPropertyName(Store, referenceNode.target);
    }
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
.picking {
  font-weight: bold;
}
.bring-to-front {
  z-index: 1;
}

</style>
