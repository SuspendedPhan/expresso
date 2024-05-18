<template>
  <div>
    <div v-for="fun in funs" :key="fun.getId()">
      <ProjectFunction :fun="fun" class="p-10"/>
    </div>
    <AddForm @submit="addFunction" button-label="Add Function" />
  </div>
</template>
<script lang="ts">
import {inject, ref} from "vue";
import Functions from "@/code/Functions";
import ProjectFunction from "@/components/ProjectFunction.vue";
import WordCollection from "@/store/WordCollection";
import AddForm from "@/components/AddForm.vue";

export default {
  components: {AddForm, ProjectFunction},
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

    const name = ref('');
    function addFunction(name) {
      const funName = WordCollection.toRandomWordIfEmpty(name);
      const fun = emModule.Function.makeUnique(funName);
      fun.setRootNode(Functions.makeZero(emModule))
      project.addFunction(fun);
    }
    
    return {
      funs,
      addFunction,
      name
    };
  }
}
</script>
