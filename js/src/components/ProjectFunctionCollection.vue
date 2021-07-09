<template>
  <div>
    <div v-for="fun in funs" :key="fun.getId()">
      <ProjectFunction :fun="fun"/>
    </div>
  </div>
</template>
<script lang="ts">
import {inject, provide, ref} from "@vue/composition-api";
import Functions from "@/code/Functions";
import ProjectFunction from "@/components/ProjectFunction.vue";

export default {
  components: {ProjectFunction},
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
