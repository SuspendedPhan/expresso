<template>
  <div></div>
</template>

<script lang="ts">
import GoModule from "../../public/mymodule.wasm";

declare var Go: any;

export default {
  name: "GoTest",
  setup() {
    const go = new Go();
    WebAssembly.instantiateStreaming(fetch(GoModule), go.importObject).then((result) => {
      go.run(result.instance);
    });
  }
}
</script>

<style scoped>
</style>