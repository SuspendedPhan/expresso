<script setup>
import { ComponentStore } from '@/store/ComponentStore'
import Comp from '@/main-components/ExpComponent.vue'
import { Component } from '@/domain/Component'
import { ref } from 'vue'

const count = ref(0)

const go = new Go()
WebAssembly.instantiateStreaming(fetch('mymodule.wasm'), go.importObject).then((result) => {
  go.run(result.instance)
  const h = GoModule.hello()
  console.log(h)

  // const renderer = new PixiRenderer(viewport.value, canvas.value)
  // const onFrame = () => {
  //   // ticker.tick()
  //   GoModule.eval(renderer.circlePool, renderer.circles)
  //   window.requestAnimationFrame(onFrame)
  // }
  // onFrame()
})

const store = new ComponentStore()
const components = ref([])
components.value = [new Component()]
store.getComponents().subscribe((data) => {
  components.value = [...data]
})
</script>

<template>
  <button @click="store.addComponent">Add Component</button>
  <div v-for="component in components" :key="component.id">
    <Comp :component="component" />
  </div>
</template>
