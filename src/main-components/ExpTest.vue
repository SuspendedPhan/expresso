<script setup lang="ts">
import NumberExpr from '@/main-components/NumberExpr.vue'
import ExprSelect from '@/main-components/ExprSelect.vue'
import { NumberExpr as NumberExprModel } from '@/domain/Domain'
import GoModuleLoader from '@/store/GoModuleLoader'
import { BehaviorSubject, combineLatest, map, tap } from 'rxjs'
import { useObservable } from '@vueuse/rxjs'
import { ref } from 'vue'

const goModule$ = GoModuleLoader.get$()
const expr$ = new BehaviorSubject<NumberExprModel>(new NumberExprModel(0))

const result = useObservable(
  combineLatest([goModule$, expr$]).pipe(
    map(([goModule, expr]) => {
      const evaluator = goModule.createEvaluator(expr)
      return evaluator.eval()
    })
  )
)

function onSelect(selectedExpr: NumberExprModel) {
  expr$.next(selectedExpr)
}
</script>

<template>
  <div>
    <span class="mr-2">Input</span>
    <NumberExpr :expr$="expr$" class="inline" />
    <ExprSelect @select="onSelect" class="block" />
  </div>

  <div>
    <span class="mr-2">Result</span>
    <div>{{ result }}</div>
  </div>
</template>
