<script setup lang="ts">
import type { NumberExpr } from '@/domain/Domain'
import { useObservable } from '@vueuse/rxjs'
import { ref } from 'vue'

const props = defineProps(['expr'])
const expr: NumberExpr = props.expr

const value = expr.getValue()
</script>

<template>
  <div>{{ value }}</div>
</template>
