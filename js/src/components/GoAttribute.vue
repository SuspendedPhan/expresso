<template>
  <div>
    <div>
      {{ id }}
    </div>
    <GoNode :key="rootNodeId" :setup-func="rootNodeSetupFunc"></GoNode>
  </div>
</template>

<script>
import GoNode from "@/components/GoNode";
export default {
  name: "GoAttribute",
  components: {GoNode},
  props: {setupFunc: {}},
  setup(props) {
    return props.setupFunc();
  }
}
</script>

<style scoped>

</style>