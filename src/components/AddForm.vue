<template>
  <div>
    <input v-model="name" :placeholder="buttonLabel" />
    <button @click="onClick">{{ buttonLabel }}</button>
  </div>
</template>
<script lang="ts">
import { ref } from 'vue'

export default {
  name: 'AddForm',
  props: {
    buttonLabel: {}
  },
  setup(props, { emit }) {
    const name = ref('')
    function onClick() {
      emit('submit', name.value)
    }

    return {
      onClick,
      name
    }
  }
}
</script>
