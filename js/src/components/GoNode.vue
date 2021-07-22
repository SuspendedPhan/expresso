<template>
  <div class="p-8">
    <div>{{Id}}</div>
    <div>{{Text}}</div>
    <input :value="NodeChoiceQuery" @input="OnNodeChoiceQueryInput" />
    <div v-for="nodeChoice in NodeChoices" :key="nodeChoice.Index">
      <div>{{nodeChoice.Text}}</div>
      <button @click="nodeChoice.CommitFunc">Commit</button>
    </div>
    <GoNode v-for="child in Children" :key="child.Id" :setup-func="child.SetupFunc">{{child}}</GoNode>
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