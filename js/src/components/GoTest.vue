<template>
  <div></div>
</template>

<script lang="ts">
import GoModuleWasm from "../../public/mymodule.wasm";
import GoProxy from "@/code/GoProxy";
import Gom from "@/code/Gom";
import {onMounted, onUnmounted} from "@vue/composition-api";

declare var Go: any;

export default {
  name: "GoTest",
  setup() {
    const go = new Go();
    WebAssembly.instantiateStreaming(fetch(GoModuleWasm), go.importObject).then((result) => {
      go.run(result.instance);
      const frog = Gom.NewFrog();
      console.log(frog.Quack());
      console.log(frog.AddOne(10));
      console.log(frog.Jump());
      console.log(frog.JumpCount());

      const friend = Gom.NewFrog();
      console.log(friend.Quack());
      frog.SetFriend(friend);
      console.log(frog.GetFriend().JumpCount());
    });
  }
}
</script>

<style scoped>
</style>