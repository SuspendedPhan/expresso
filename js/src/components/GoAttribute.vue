<template>
  <div>
    <div>
      {{name}}
    </div>
    <div class="relative" :style="{ width: nodeTreeWidth, height: nodeTreeHeight }">
      <GoNode :key="rootNodeId" :setup-func="rootNodeSetupFunc"></GoNode>
    </div>
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