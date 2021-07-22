<template>
  <div>
    <div class="flex">
      <div class="w-1/2 h-full">
        <GoOrganism v-if="setupRootOrganism !== null" :setupFunc="setupRootOrganism" />
      </div>
      <div ref="viewport" class="h-full w-1/2">
        <canvas ref="canvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import GoModuleWasm from "../../public/mymodule.wasm";
import GoProxy from "@/code/GoProxy";
import Gom from "@/code/Gom";
import {computed, onMounted, onUnmounted, ref, watch} from "@vue/composition-api";
import GoAttribute from "@/components/GoAttribute.vue";
import GoOrganism from "@/components/GoOrganism.vue";

declare var Go: any;

export default {
  name: "GoTest",
  components: {GoOrganism, GoAttribute},
  setup() {
    const go = new Go();
    const setupRootOrganism = ref(null);
    WebAssembly.instantiateStreaming(fetch(GoModuleWasm), go.importObject).then((result) => {
      go.run(result.instance);
      setupRootOrganism.value = () => GoModule.setupRootOrganism(ref, watch, computed);
    });

    return {setupRootOrganism};
  }
}
</script>

<style scoped>
</style>