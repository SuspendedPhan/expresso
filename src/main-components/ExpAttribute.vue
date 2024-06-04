<script setup>
import { ref } from 'vue'
import { useObservable } from '@vueuse/rxjs'
import ExpExpr from './ExpExpr.vue'

const { attribute } = defineProps(['attribute'])
const expr = useObservable(attribute.getExpr())
</script>

<template>
  <div>
    <div>{{ attribute.id }}</div>
    <ExpExpr :expr="expr" />
  </div>
</template>
