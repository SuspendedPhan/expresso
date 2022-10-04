<template>
  <div>
    <GoAttribute v-for="attribute in attributes" :key="attribute.id" :setup-func="attribute.setupFunc"/>
  </div>
</template>

<script>
import GoAttribute from "@/components/GoAttribute";

export default {
  name: "GoOrganism",
  components: {GoAttribute},
  props: {setupFunc: {}},
  setup(props) {
    // setupFunc() returns an object where all the keys can be used as variables in the template
    return props.setupFunc();
  }
}
</script>

<style scoped>

</style>