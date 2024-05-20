<template>
  <div>
    <div class="flex">
      <div class="w-1/2 h-full">
        <GoExpressor v-if="setupExpressor !== null" :setupFunc="setupExpressor" />
      </div>
      <div ref="viewport" class="h-full w-1/2">
        <canvas ref="canvas"></canvas>
      </div>
      <div class="fixed top-0 right-0 text-white">{{ framesPerSecond }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import init from '../mymodule.wasm?init'
import { computed, onMounted, onUnmounted, ref, watch, readonly, nextTick } from 'vue'
import GoExpressor from '@/components/GoExpressor.vue'
import PixiRenderer from '@/code/PixiRenderer'
// import fps from "fps";
import numeral from 'numeral'
import { ElementLayout } from '@/code/ElementLayout'
import { ResizeSensor } from 'css-element-queries'

// Defined in public/wasm_exec.js, which is loaded in index.html
declare var Go: any

// Defined in go_module.go, available after go.run(result.instance)
declare var GoModule: any

export default {
  name: 'GoTest',
  components: { GoExpressor },
  setup() {
    const setupExpressor = ref<any>(null)
    const viewport = ref(null)
    const canvas = ref(null)

    const go = new Go()
    WebAssembly.instantiateStreaming(fetch('mymodule.wasm'), go.importObject).then((result) => {
      go.run(result.instance)
      setupExpressor.value = () =>
        GoModule.setupExpressor(
          ref,
          watch,
          computed,
          readonly,
          onUnmounted,
          nextTick,
          ElementLayout,
          ResizeSensor
        )
      const renderer = new PixiRenderer(viewport.value, canvas.value)
      const onFrame = () => {
        // ticker.tick()
        GoModule.eval(renderer.circlePool, renderer.circles)
        window.requestAnimationFrame(onFrame)
      }
      onFrame()
    })

    // fetch(GoModuleWasm)
    //   .then((response) => response.arrayBuffer())
    //   .then((bytes) => WebAssembly.instantiate(bytes, go.importObject))
    //   .then((result) => {
    //     go.run(result.instance)

    //     setupExpressor.value = () =>
    //       GoModule.setupExpressor(
    //         ref,
    //         watch,
    //         computed,
    //         readonly,
    //         onUnmounted,
    //         nextTick,
    //         ElementLayout,
    //         ResizeSensor
    //       )
    //     const renderer = new PixiRenderer(viewport.value, canvas.value)
    //     const onFrame = () => {
    //       ticker.tick()
    //       GoModule.eval(renderer.circlePool, renderer.circles)
    //       window.requestAnimationFrame(onFrame)
    //     }
    //     onFrame()
    //   });

    const framesPerSecond = ref('00')
    // const ticker = fps({ every: 10 });
    // ticker.on("data", (framerate) => (framesPerSecond.value = numeral(framerate).format("0")));

    return { setupExpressor, viewport, canvas, framesPerSecond }
  }
}
</script>

<style scoped></style>
