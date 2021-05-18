<template>
  <div ref="viewport" class="w-full h-1/2">
    <canvas ref="canvas"></canvas>
    <FakeBook v-if='fake' :fake="fake" />
    <WasmExpressor v-if="tree" :tree="tree"></WasmExpressor>
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

@Component({
  components: {WasmExpressor, FakeBook},
})
export default class WasmTest extends Vue {
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

    // console.log("before fake");
    //
    // this.fake = module.FakeBook.make(() => {
    //   console.log("deleted");
    // });
    // this.fake.setValue("yoyo");
    // console.log(this.fake);
    //
    // console.log("after fake");

    function render(tree, renderer) {
      const evalOutput = tree.eval();
      renderer.render(evalOutput);
      evalOutput.delete();
      window.requestAnimationFrame(() => render(tree, renderer));
    }

    const renderer = new PixiRenderer(this.$refs['viewport'], this.$refs['canvas']);
    const tree = new module.ExpressorTree();
    module.ExpressorTree.populateTestTree(tree);

    const attributeVector = tree.getRootOrganism().getAttributes();
    const attributes = Functions.vectorToArray(attributeVector);
    const numberNode = module.NumberNode.make(20);
    const attribute = attributes[0];
    const rootNode = attribute.getRootNode();
    module.EmbindUtil.setSignalListener(attribute.getOnChangedSignal(), () => {
      console.log("yay!");
    });
    rootNode.replace(numberNode);
    this.tree = tree;

    render(tree, renderer);
  }
}

</script>
<style scoped>
</style>