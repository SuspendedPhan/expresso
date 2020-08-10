<template>
  <span v-if="node.value != null">{{ node.value }}</span>
  <span v-else>
    <span>{{ node.name }}(</span>
    <span v-for="(child, index) in node.children" :key="index">
      <Node :node="child" />
      <span v-if="index !== node.children.length - 1">, </span>
    </span>
    <span>)</span>
  </span>
</template>

<script>
import Nodes from "../code/Nodes";

export default {
  name: 'Node',
  components: {
  },
  props: {
    node: new Nodes.Number(0),
  },
  data: () => {
    return { };
  },
  methods: {
  }
}
</script>

<style scoped>
</style>
