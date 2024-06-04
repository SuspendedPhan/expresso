<script setup>
import { ref } from 'vue'
import Store from '@/store/Store'
import { useObservable } from '@vueuse/rxjs'
import NumberExpr from '@/main-components/NumberExpr.vue'
import { NumberExpr as NumberExprModel } from '@/domain/Domain'

const expr = ref(new NumberExprModel(2))
</script>

<template>
  <NumberExpr :expr="expr" />
</template>
