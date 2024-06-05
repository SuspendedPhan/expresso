<script setup>
import { ref } from 'vue'
import Store from '@/store/Store'
import { useObservable } from '@vueuse/rxjs'
import { timer, map, pipe } from 'rxjs'
import NumberExpr from '@/main-components/NumberExpr.vue'
import { NumberExpr as NumberExprModel } from '@/domain/Domain'
import AutoComplete from 'primevue/autocomplete'
import GoModuleLoader from '@/store/GoModuleWrapper'

// const expr = ref(new NumberExprModel(2))
const loader = GoModuleLoader.get()
const r = ref(-1)
loader.subscribe((goModule) => {
  const evaluator = goModule.createEvaluator(new NumberExprModel(2))
  r.value = evaluator.eval()
})
const autoComplete = ref('')

const suggestions = ref([1, 2, 3])
function onComplete({ query }) {
  // convert query to number
  const n = parseFloat(query)
  if (isNaN(n)) {
    suggestions.value = []
  }
  suggestions.value = [n]
}
</script>

<template>
  <!-- <NumberExpr :expr="expr" /> -->
  <div>{{ r }}</div>
  <AutoComplete v-model="autoComplete" :suggestions="suggestions" @complete="onComplete" />
</template>
