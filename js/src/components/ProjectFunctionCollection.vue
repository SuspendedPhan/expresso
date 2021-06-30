<template>
  <div>
    <div v-for="fun in funs" :key="fun.getId()">
      <div>{{ fun.getName() }}</div>
      <WasmNode :node="fun.getRootNode()" />
    </div>
  </div>
</template>
<script lang="ts">
import WasmNode from "@/components/WasmNode.vue";
import {inject, ref} from "@vue/composition-api";
import Functions from "@/code/Functions";

export default {
  components: {WasmNode},
  props: {
    project: {}
  },
  setup(props) {
    const project = props.project;
    const emModule = inject<any>('getEmModule')();

    const funs = ref(Functions.vectorToArray(project.getFunctions()));
    emModule.EmbindUtil.setSignalListener(project.getOnFunctionsChangedSignal(), () => {
      funs.value = Functions.vectorToArray(project.getFunctions());
    });
    return {
      funs
    };
  }
}
</script>
