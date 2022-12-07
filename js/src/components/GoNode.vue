<template>
  <div :class="['absolute border-solid', {'border-2': isFocused }]" :style="{ left: position.left + 'px', top: position.top + 'px' }" ref="rootElement" @click="onClick">
    <div>{{ text }}</div>
    <input :value="nodeChoiceQuery" @input="onNodeChoiceQueryInput"/>
    <div v-for="nodeChoice in nodeChoices" :key="nodeChoice.Index">
      <div>{{ nodeChoice.text }}</div>
      <button @click="nodeChoice.commitFunc">Commit</button>
    </div>
    <GoNode v-for="child in children" :key="child.key" :setupFunc="child.setupFunc"/>
  </div>
</template>

<script lang="ts">

export default {
  name: "GoNode",
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