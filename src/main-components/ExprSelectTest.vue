<script setup>
import { ref } from 'vue'
import ExprSelect from '@/main-components/ExprSelect.vue'

function onSelect(expr) {
  console.log(expr)
}
</script>

<template>
  <ExprSelect @select="onSelect" />
</template>
