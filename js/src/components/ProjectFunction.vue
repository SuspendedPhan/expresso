<template>
  <div>
    <div>{{ fun.getName() }}</div>
    <TreeLayout :elementLayout="elementLayout">
      <WasmNode :node="fun.getRootNode()"/>
    </TreeLayout>
  </div>
</template>
<script lang="ts">
import WasmNode from "@/components/WasmNode.vue"
import {provide} from "@vue/composition-api";
import {ElementLayout} from "@/code/ElementLayout";
import Store from "@/models/Store";
import TreeLayout from "@/components/TreeLayout.vue";

export default {
  name: 'ProjectFunction',
  components: {TreeLayout, WasmNode},
  props: {
    fun: {}
  },
  setup(props) {
    const elementLayout = new ElementLayout(() => props.fun.getRootNode(), node => Store.getChildren(node), (node) => node.getId());
    provide('nodeLayout', elementLayout);
    return {
      elementLayout
    };
  }
}
</script>