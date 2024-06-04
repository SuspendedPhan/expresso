<script setup>
import { ref } from 'vue'
defineProps(['attribute'])
</script>

<template>
  <div>
    <div>{{ attribute.id }}</div>
  </div>
</template>
