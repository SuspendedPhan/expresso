<template>
  <div class="p-8">
    <div>{{ text }}</div>
    <input :value="nodeChoiceQuery" @input="onNodeChoiceQueryInput"/>
    <div v-for="nodeChoice in nodeChoices" :key="nodeChoice.Index">
      <div>{{ nodeChoice.text }}</div>
      <button @click="nodeChoice.commitFunc">Commit</button>
    </div>
<!--    <GoNode v-for="child in Children" :key="child.Id" :setup-func="child.SetupFunc">{{ child }}</GoNode>-->
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