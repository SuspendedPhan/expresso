<template>
  <div>
    <div>{{id}}</div>
    <div>{{text}}</div>
    <input v-model="nodeChoiceQuery" />
    <div v-for="nodeChoice in nodeChoices" :key="nodeChoice.index">
      <div>{{nodeChoice.text}}</div>
      <button @click="nodeChoice.commit">Commit</button>
    </div>
  </div>
</template>

<script lang="ts">

export default {
  name: "GoNode",
  props: {
    setupFunc: {}
  },
  setup(props) {
    return props.setupFunc();
  }
}
</script>

<style scoped>
</style>