<template>
  <div ref="viewport" class="w-full h-full">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script lang="ts">

import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import Vue from "vue";

import WasmModule from '@/../public/WasmModule.js';
import Wasm from "@/../public/WasmModule.wasm";
import PixiRenderer from "@/code/PixiRenderer";

@Component({
  components: {},
})
export default class WasmTest extends Vue {
  async mounted() {
    const module = await WasmModule({
      locateFile: (path) => {
        if (path.endsWith('.wasm')) {
          return Wasm;
        }
        return path;
      },
    });
    module.sayHello();

    const evalOutput = module.ExpressorTree.test();
    const renderer = new PixiRenderer(this.$refs['viewport'], this.$refs['canvas']);
    renderer.render(evalOutput);
  }
}

</script>
<style scoped>
</style>