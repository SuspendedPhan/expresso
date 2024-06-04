<script setup>
import { ref } from 'vue'
const { expr } = defineProps(['expr'])
</script>

<template>
  <div>
    <div>{{ expr.id }}</div>
    <div>{{ expr.getText() }}</div>
  </div>
</template>
