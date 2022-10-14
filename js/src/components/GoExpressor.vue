<template>
  <div>
    <GoOrganism v-for="organism in rootOrganisms" :key="organism.id" :setup-func="organism.setupFunc"/>
    <button
        class="button"
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