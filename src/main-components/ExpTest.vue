<script setup>
import { ref } from 'vue'
import Store from '@/store/Store'
import { useObservable } from '@vueuse/rxjs'
import { timer, map, pipe } from 'rxjs'
import NumberExpr from '@/main-components/NumberExpr.vue'
import { NumberExpr as NumberExprModel } from '@/domain/Domain'
import Evaluator from '@/store/Evaluator'

// const expr = ref(new NumberExprModel(2))
const robs = timer(100).pipe(map(() => Evaluator.eval(new NumberExprModel(2))))
const r = useObservable(robs)
</script>

<template>
  <!-- <NumberExpr :expr="expr" /> -->
  <div>{{ r }}</div>
</template>
