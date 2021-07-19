<template>
  <div>
    <GoNode v-if="isReady"/>
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
    const isReady = ref(false);
    WebAssembly.instantiateStreaming(fetch(GoModuleWasm), go.importObject).then((result) => {
      go.run(result.instance);
      isReady.value = true;
    });
    return {isReady};
  }
}
</script>

<style scoped>
</style>