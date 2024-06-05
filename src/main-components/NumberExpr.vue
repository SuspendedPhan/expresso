<script setup lang="ts">
import type { NumberExpr } from '@/domain/Domain'
import { useObservable } from '@vueuse/rxjs'
import { Observable, map } from 'rxjs'

const props = defineProps(['expr$'])
const expr$ = props.expr$ as Observable<NumberExpr>
const value = useObservable(expr$.pipe(map((e) => e.getValue())))
</script>

<template>
  <div>{{ value }}</div>
</template>
