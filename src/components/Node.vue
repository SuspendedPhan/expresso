<template>
  <span class='node-root'>
    <span v-if='astNode.value != null' @click='click'>{{ astNode.value }}</span>
    <span v-else>
      <span @click='click'>{{ astNode.name.toLowerCase() }}(</span>
      <span v-for='(child, index) in astNode.children' :key='index'>
        <Node :astNode='child' />
        <span v-if='index !== astNode.children.length - 1'>, </span>
      </span>
      <span>)</span>
    </span>
    <MetaNodeSearcher ref='searcher' @blur='blur' v-if='showSearcher' @metaNodeSelected='metaNodeSelected' class='searcher' />
  </span>
</template>

<script>
import MetaNodeSearcher from "./MetaNodeSearcher";
import NodeActions from "../code/NodeActions";

export default {
  name: 'Node',
  components: {
    MetaNodeSearcher,
  },
  props: {
    astNode: { value: 0 }
  },
  data: () => {
    return {
      showSearcher: false,
    };
  },
  methods: {
    metaNodeSelected(entry) {
      console.log(entry);
      NodeActions.replace(this.astNode, entry.metaNode.make(this.astNode.parent, entry.params));
    },
    click() {
      this.showSearcher = true;
      this.$nextTick().then(() => {
        this.$refs['searcher'].focus();
      });
    },
    blur() {
      this.showSearcher = false;
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
</style>
