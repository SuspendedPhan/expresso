<script setup>
import { ref } from 'vue'
defineProps(['component'])
</script>

<template>
  <div>
    <div>{{ component.id }}</div>
  </div>
</template>
