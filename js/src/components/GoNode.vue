<template>
  <div :class="['absolute border-solid border-2 border-gray-400 p-0.5 bg-white', {'border-blue-400': isFocused }]" :style="{ left: position.left + 'px', top: position.top + 'px' }" ref="rootElement" @click="onClick">
    <div>{{ text }}</div>
    <Searchbox v-show="nodePickerVisible" class="z-1 bg-gray-500" ref="nodePicker" :choices="nodePickerChoices" :query="nodePickerQuery" @queryInput="nodePickerOnQueryInput" @choiceCommitted="nodePickerOnCommit" />
    <GoNode v-for="child in children" :key="child.key" :setupFunc="child.setupFunc"/>
  </div>
</template>

<script lang="ts">

import Searchbox from "@/components/Searchbox.vue";

export default {
  name: "GoNode",
  components: {Searchbox},
  props: {
    setupFunc: {}
  },
  setup(props) {
    const upFunc = props.setupFunc();
    console.log(upFunc);
    return upFunc;
  }
}
</script>

<style scoped>
</style>