<template>
  <div>
    <GoNode v-if="setupRootNode !== null" :setupFunc="setupRootNode" />
  </div>
</template>

<script lang="ts">
import GoModuleWasm from "../../public/mymodule.wasm";
import GoProxy from "@/code/GoProxy";
import Gom from "@/code/Gom";
import {onMounted, onUnmounted, ref} from "@vue/composition-api";
import GoNode from "@/components/GoNode.vue";

declare var Go: any;

export default {
  name: "GoTest",
  components: {GoNode},
  setup() {
    const go = new Go();
    const setupRootNode = ref(null);
    WebAssembly.instantiateStreaming(fetch(GoModuleWasm), go.importObject).then((result) => {
      go.run(result.instance);
      setupRootNode.value = () => GoModule.setupRootNode(ref);
    });

    return {setupRootNode};
  }
}
</script>

<style scoped>
</style>