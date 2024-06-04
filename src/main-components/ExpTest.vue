<script setup>
import { ref } from 'vue'
import Store from '@/store/Store'
import { useObservable } from '@vueuse/rxjs'
import { timer, map, pipe } from 'rxjs'
import NumberExpr from '@/main-components/NumberExpr.vue'
import { NumberExpr as NumberExprModel } from '@/domain/Domain'
import GoModuleLoader from '@/store/GoModuleWrapper'

// const expr = ref(new NumberExprModel(2))
const loader = GoModuleLoader.get()
const r = ref(-1)
loader.subscribe((goModule) => {
  const evaluator = goModule.createEvaluator(new NumberExprModel(2))
  r.value = evaluator.eval()
  console.log(r.value)
})
</script>

<template>
  <!-- <NumberExpr :expr="expr" /> -->
  <div>{{ r }}</div>
</template>
