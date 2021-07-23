<template>
  <div>
    <div class="flex">
      <div class="w-1/2 h-full">
        <GoOrganism v-if="setupRootOrganism !== null" :setupFunc="setupRootOrganism"/>
      </div>
      <div ref="viewport" class="h-full w-1/2">
        <canvas ref="canvas"></canvas>
      </div>
      <div class="fixed top-0 right-0 text-white">{{framesPerSecond}}</div>
    </div>
  </div>
</template>

<script lang="ts">
import GoModuleWasm from "../../public/mymodule.wasm";
import {computed, onMounted, onUnmounted, ref, watch} from "@vue/composition-api";
import GoOrganism from "@/components/GoOrganism.vue";
import PixiRenderer from "@/code/PixiRenderer";
import fps from "fps";
import numeral from "numeral";

declare var Go: any;
declare var GoModule: any;

export default {
  name: "GoTest",
  components: {GoOrganism},
  setup() {
    const go = new Go();
    const setupRootOrganism = ref<any>(null);
    const viewport = ref(null);
    const canvas = ref(null);

    WebAssembly.instantiateStreaming(fetch(GoModuleWasm), go.importObject).then((result) => {
      go.run(result.instance);
      setupRootOrganism.value = () => GoModule.setupRootOrganism(ref, watch, computed);
      const renderer = new PixiRenderer(viewport.value, canvas.value);
      const onFrame = () => {
        ticker.tick();
        GoModule.eval(renderer.circlePool, renderer.circles);
        window.requestAnimationFrame(onFrame);
      };
      onFrame();
    });

    const framesPerSecond = ref("00");
    const ticker = fps({ every: 10 });
    ticker.on("data", (framerate) => (framesPerSecond.value = numeral(framerate).format("0")));

    return {setupRootOrganism, viewport, canvas, framesPerSecond};
  }
}
</script>

<style scoped>
</style>