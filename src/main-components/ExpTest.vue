<script setup>
import { ref } from 'vue'
import Store from '@/store/Store'
import { useObservable } from '@vueuse/rxjs'

const store = new Store()
const result = useObservable(store.getResult())
</script>

<template>
  <div>{{ result }}</div>
</template>
