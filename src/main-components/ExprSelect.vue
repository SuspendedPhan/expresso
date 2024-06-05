<script setup>
import { ref } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import { NumberExpr } from '@/domain/Domain'

// Emits a new Expr
const emit = defineEmits(['select'])
const autoComplete = ref('')
const suggestions = ref([1, 2, 3])
function onComplete({ query }) {
  // convert query to number
  const n = parseFloat(query)
  if (isNaN(n)) {
    suggestions.value = []
  }
  suggestions.value = [
    {
      label: n,
      createExprFn: () => new NumberExpr(n)
    }
  ]
}

function onItemSelect({ value }) {
  emit('select', value.createExprFn())
  autoComplete.value = ''
}
</script>

<template>
  <AutoComplete
    v-model="autoComplete"
    :suggestions="suggestions"
    @complete="onComplete"
    @item-select="onItemSelect"
    :autoOptionFocus="true"
    :delay="0"
  />
</template>
