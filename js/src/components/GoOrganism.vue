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
    return props.setupFunc();
  }
}
</script>

<style scoped>

</style>