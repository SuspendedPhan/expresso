<template>
  <div class="max-w-fit">
    <div class="border-solid border-b-2 border-gray-400 p-0.5">
      {{ name }}
    </div>
    <div
      class="relative node-v-margin mx-2"
      :style="{ width: nodeTreeWidth, height: nodeTreeHeight }"
    >
      <TreeLayout :elementLayout="nodeTreeLayout">
        <GoNode :key="rootNodeId" :setup-func="rootNodeSetupFunc"></GoNode>
      </TreeLayout>
    </div>
    <button class="mt-4">Remove</button>
  </div>
</template>

<script>
import GoNode from '@/components/GoNode.vue'
import TreeLayout from '@/components/TreeLayout.vue'

export default {
  name: 'GoAttribute',
  components: { TreeLayout, GoNode },
  props: { setupFunc: {} },
  setup(props) {
    return props.setupFunc()
  }
}
</script>

<style scoped>
.max-w-fit {
  max-width: fit-content;
}
.node-v-margin {
  margin-top: 25px;
}
</style>
