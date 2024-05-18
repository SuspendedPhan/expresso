<template>
  <div class="text-center text-base m-4">
    <TreeLayout class="mx-auto m-8" v-for="organism in rootOrganisms" :key="organism.id" :elementLayout="organism.elementLayout">
      <GoOrganism :setup-func="organism.setupFunc"/>
    </TreeLayout>
    <button
        class="button m-8"
        @click="addOrganism()"
    >Add Organism
    </button>
  </div>
</template>

<script>
import GoOrganism from "@/components/GoOrganism.vue";
import TreeLayout from "@/components/TreeLayout.vue";

export default {
  name: "GoExpressor",
  components: {TreeLayout, GoOrganism},
  props: {setupFunc: {}},
  setup(props) {
    // setupFunc() returns an object where all the keys can be used as variables in the template
    return props.setupFunc();
  }
}
</script>

<style scoped>

</style>