<template>
  <div class="p-8">
    <div>{{id}}</div>
    <div>{{text}}</div>
    <input v-model="nodeChoiceQuery" />
    <div v-for="nodeChoice in nodeChoices" :key="nodeChoice.index">
      <div>{{nodeChoice.text}}</div>
      <button @click="nodeChoice.commit">Commit</button>
    </div>
    <GoNode v-for="child in children" :key="child.id" :setup-func="child.setupFunc">{{child}}</GoNode>
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