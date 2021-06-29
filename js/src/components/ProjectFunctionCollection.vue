<template>
  <div>
    <div>{{ count }}</div>
    <button @click="() => this.count++">Click me</button>
  </div>
</template>
<script lang="ts">
export default {
  setup() {
    return {
      count: 0
    }
  }
}
</script>
