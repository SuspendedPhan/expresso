<template>
  <div>
  </div>
</template>

<script lang="ts">

import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import Vue from "vue";

import WasmModule from '@/../public/WasmModule.js';
import Wasm from "@/../public/WasmModule.wasm";

@Component({
  components: {},
})
export default class WasmTest extends Vue {
  async mounted() {
    const module = await WasmModule({
      locateFile: (path) => {
        console.log(module);
        console.log("lcoateFile");
        if (path.endsWith('.wasm')) {
          return Wasm;
        }
        return path;
      },
    });
    module.sayHello();

    // const ast = new module.ExpressorTree();
    const evalOutput = module.ExpressorTree.test();
    const organismOutput = evalOutput.getRootOrganism();
    console.log(organismOutput);
  }
}

</script>
<style scoped>
</style>