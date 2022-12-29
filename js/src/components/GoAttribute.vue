<template>
  <div class="max-w-fit">
    <div class="border-solid border-b-2 border-gray-400 p-0.5">
      {{name}}
    </div>
    <div class="relative m-4" :style="{ width: nodeTreeWidth, height: nodeTreeHeight }">
      <GoNode :key="rootNodeId" :setup-func="rootNodeSetupFunc"></GoNode>
    </div>
    <button class="mt-4">Remove</button>
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
.max-w-fit {
  max-width: fit-content;
}
</style>