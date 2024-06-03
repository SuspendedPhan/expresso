<script setup>
import { ref } from 'vue'

const count = ref(0)

setTimeout(() => {
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
}, 200)
</script>

<template>
  <button @click="count++">You clicked me {{ count }} times.</button>
</template>
