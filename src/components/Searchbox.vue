<template>
  <div class="absolute border border-black">
    <input
      class="input bg-transparent"
      ref="input"
      @blur="blur"
      @keydown="keydown"
      :value="query"
      @input="onInput"
    />
    <div class="border border-solid"></div>
    <div>
      <div v-for="(choice, index) in choices" :key="index" @mousedown="onClick(choice, $event)">
        {{ choice.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps({
  choices: { type: Array, required: true },
  query: String
})
const emit = defineEmits(['queryInput', 'choiceCommitted', 'blur'])
defineExpose({ focus })

const input = ref(null)

function onClick(choice: any, event: any) {
  emitChoiceCommitted(choice)
}

function onInput(event: any) {
  emit('queryInput', event)
}

function keydown(event: any) {
  if (event.key === 'Enter' && props.choices.length > 0) {
    emitChoiceCommitted(props.choices[0])
  }
}

function emitChoiceCommitted(choice: any) {
  emit('choiceCommitted', choice)
}

function focus() {
  input.value.focus()
}

function blur() {
  emit('blur')
}
</script>
<style scoped></style>
