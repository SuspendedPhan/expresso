<template>
  <div>
    <div>{{id}}</div>
    <button @click="replaceChild">Replace Child</button>
    <GoNode v-if="child" :key="child.id" :setupFunc="child.setupFunc" />
  </div>
</template>

<script lang="ts">
import {ref} from "@vue/composition-api";

export default {
  name: "GoNode",
  props: {
    setupFunc: {}
  },
  setup(props) {
    const data = props.setupFunc();
    console.log(data);
    return data;
  }
}
</script>

<style scoped>
</style>