<template>
  <div class="flex">
    <WasmExpressor class="w-1/2 h-full" v-if="project" :project="project"></WasmExpressor>
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
import Store from "@/models/Store";

@Component({
  components: {WasmExpressor, FakeBook},
})
export default class WasmTest extends Vue {
  fake = null;
  project = null;

  async mounted() {
    const module = await WasmModule({
      locateFile: (path) => {
        if (path.endsWith('.wasm')) {
          return Wasm;
        }
        return path;
      },
    });
    window.wasmModule = module;

    function render(project, renderer) {
      const evalOutput = project.evalOrganismTree();
      renderer.render(evalOutput);
      evalOutput.delete();
      window.requestAnimationFrame(() => render(project, renderer));
    }

    const renderer = new PixiRenderer(this.$refs['viewport'], this.$refs['canvas']);

    const store = new Store(module);
    const project = store.addProject();
    const attributeVector = project.getRootOrganism().getAttributes();
    const attributes = Functions.vectorToArray(attributeVector);
    const numberNode = module.NumberNode.make(20);
    const attribute = attributes[0];
    const rootNode = attribute.getRootNode();
    rootNode.replace(numberNode);
    this.project = project;

    render(project, renderer);
  }
}

</script>
<style scoped>
</style>