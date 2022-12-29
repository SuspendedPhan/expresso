<template>
  <div class="text-center text-base m-4">
    <GoOrganism class="mt-16" v-for="organism in rootOrganisms" :key="organism.id" :setup-func="organism.setupFunc"/>
    <button
        class="button m-8"
        @click="addOrganism()"
    >Add Organism</button>
  </div>
</template>

<script>
import GoOrganism from "@/components/GoOrganism";

export default {
  name: "GoExpressor",
  components: {GoOrganism},
  props: {setupFunc: {}},
  setup(props) {
    // setupFunc() returns an object where all the keys can be used as variables in the template
    return props.setupFunc();
  }
}
</script>

<style scoped>

</style>