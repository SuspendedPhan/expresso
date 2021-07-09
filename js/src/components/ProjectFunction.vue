<template>
  <div>
    <div>{{ fun.getName() }}</div>
    <div v-for="parameter in parameters" :key="parameter.getId()">
      <ProjectFunctionParameter :parameter="parameter"/>
    </div>
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
import ProjectFunctionParameter from "@/components/ProjectFunctionParameter.vue";
import Functions from "@/code/Functions";

export default {
  name: 'ProjectFunction',
  components: {ProjectFunctionParameter, TreeLayout, WasmNode},
  props: {
    fun: {}
  },
  setup(props) {
    const elementLayout = new ElementLayout(() => props.fun.getRootNode(), node => Store.getChildren(node), (node) => node.getId());
    const parameters = Functions.vectorToArray(props.fun.getParameters());
    provide('nodeLayout', elementLayout);
    return {
      elementLayout,
      parameters
    };
  }
}
</script>