<template>
  <div>
    <div>{{ fun }}</div>
    <WasmNode :node="fun"/>
  </div>
</template>
<script lang="ts">
import WasmNode from "@/components/WasmNode.vue"
import {provide} from "@vue/composition-api";
import {ElementLayout} from "@/code/ElementLayout";
import Store from "@/models/Store";

export default {
  name: 'ProjectFunction',
  components: {WasmNode},
  props: {
    fun: {}
  },
  setup(props) {
    provide('nodeLayout', new ElementLayout(() => props.fun.getRootNode(), Store.getChildren, (node) => node.getId()));
  }
}
</script>