<script setup>
import { ref } from 'vue'
import Store from '@/store/Store'
import { useObservable } from '@vueuse/rxjs'

const store = new Store()
const result = useObservable(store.getResult())
const value = useObservable(store.getValue())
</script>

<template>
  <input type="number" @input="(e) => store.setValue(e.target.value)" :value="value" />
  <div>{{ result }}</div>
</template>
