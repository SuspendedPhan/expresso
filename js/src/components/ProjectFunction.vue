<template>
  <div>
    <div>{{ fun.getName() }}</div>
    <div v-for="parameter in parameters" :key="parameter.getId()">
      <ProjectFunctionParameter :parameter="parameter"/>
    </div>
    <AddForm button-label="Add Parameter" @submit="addParameter" />
    <TreeLayout :elementLayout="elementLayout">
      <WasmNode :node="fun.getRootNode()"/>
    </TreeLayout>
  </div>
</template>
<script lang="ts">
import WasmNode from "@/components/WasmNode.vue"
import {inject, provide, ref} from "@vue/composition-api";
import {ElementLayout} from "@/code/ElementLayout";
import Store from "@/models/Store";
import TreeLayout from "@/components/TreeLayout.vue";
import ProjectFunctionParameter from "@/components/ProjectFunctionParameter.vue";
import Functions from "@/code/Functions";
import AddForm from "@/components/AddForm.vue";
import WordCollection from "@/store/WordCollection";

export default {
  name: 'ProjectFunction',
  components: {AddForm, ProjectFunctionParameter, TreeLayout, WasmNode},
  props: {
    fun: {}
  },
  setup(props) {
    const emModule = inject<any>('getEmModule')();
    const elementLayout = new ElementLayout(() => props.fun.getRootNode(), node => Store.getChildren(node), (node) => node.getId());

    const getParameters = () => Functions.vectorToArray(props.fun.getParameters());
    const parameters = ref(getParameters());
    emModule.EmbindUtil.setSignalListener(props.fun.getOnChangedSignal(), () => {
      parameters.value = getParameters();
    });

    provide('nodeLayout', elementLayout);

    function addParameter(name) {
      const parameterName = WordCollection.toRandomWordIfEmpty(name);
      const parameter = emModule.FunctionParameter.makeUnique(parameterName);
      props.fun.addParameter(parameter);
    }

    return {
      elementLayout,
      parameters,
      addParameter
    };
  }
}
</script>