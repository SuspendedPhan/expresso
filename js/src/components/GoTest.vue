<template>
  <div></div>
</template>

<script lang="ts">
import GoModule from "../../public/mymodule.wasm";
import GoProxy from "@/code/GoProxy";

declare var Go: any;

export default {
  name: "GoTest",
  setup() {
    const go = new Go();
    WebAssembly.instantiateStreaming(fetch(GoModule), go.importObject).then((result) => {
      go.run(result.instance);
      const pro = GoProxy.make("123");
      const pro2 = GoProxy.make("423");
      const answer = pro.hi("yolo", pro2);
      console.log(answer);
    });
  }
}
</script>

<style scoped>
</style>