<template>
  <div>
    <GoAttribute v-if="setupRootAttribute !== null" :setupFunc="setupRootAttribute" />
  </div>
</template>

<script lang="ts">
import GoModuleWasm from "../../public/mymodule.wasm";
import GoProxy from "@/code/GoProxy";
import Gom from "@/code/Gom";
import {computed, onMounted, onUnmounted, ref, watch} from "@vue/composition-api";
import GoAttribute from "@/components/GoAttribute.vue";

declare var Go: any;

export default {
  name: "GoTest",
  components: {GoAttribute},
  setup() {
    const go = new Go();
    const setupRootAttribute = ref(null);
    WebAssembly.instantiateStreaming(fetch(GoModuleWasm), go.importObject).then((result) => {
      go.run(result.instance);
      setupRootAttribute.value = () => GoModule.setupRootAttribute(ref, watch, computed);
    });

    return {setupRootAttribute};
  }
}
</script>

<style scoped>
</style>