<script setup>
import { ref } from 'vue'
</script>

<template>
  <div>
    <div>{{ attribute.id }}</div>
    <ExpExpr :expr="expr" />
  </div>
</template>
