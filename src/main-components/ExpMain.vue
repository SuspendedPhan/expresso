<script setup>
import { ref } from 'vue'
import ExpProject from '@/main-components/ExpProject.vue'
import ExpTest from '@/main-components/ExpTest.vue'

const go = new Go()
WebAssembly.instantiateStreaming(fetch('mymodule.wasm'), go.importObject).then((result) => {
  go.run(result.instance)
  const h = GoModule.hello()
  console.log(h)
})
</script>

<template>
  <!-- <ExpProject /> -->
  <ExpTest />
</template>
