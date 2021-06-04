<template>
  <div class="flex">
    <WasmExpressor class="w-1/2 h-full" v-if="tree" project="tree"></WasmExpressor>
    <div ref="viewport" class="h-full w-1/2">
      <canvas ref="canvas"></canvas>
    </div>
  </div>
</template>

<script lang="ts">

import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import Vue from "vue";

import WasmModule from '@/../public/WasmModule.js';
import Wasm from "@/../public/WasmModule.wasm";
import PixiRenderer from "@/code/PixiRenderer";
import FakeBook from './FakeBook';
import WasmExpressor from "@/components/WasmExpressor.vue";
import Functions from "@/code/Functions";
import Store from "../models/Store";

@Component({
  components: {WasmExpressor, FakeBook},
})
export default class WasmTest2 extends Vue {
  fake = null;
  tree = null;

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
    window.wasmModule = module;

    const store = new Store(module);
    const project = store.addProject();
    console.log(project.getRootOrganism().getName());
    const evalOutput = project.evalOrganismTree();
    console.log(PixiRenderer.jsifyEvalOutput(evalOutput));
  }
}

</script>
<style scoped>
</style>