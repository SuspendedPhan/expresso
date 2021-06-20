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
import {Prop, Provide} from "vue-property-decorator";
import Vue from "vue";

import WasmModule from '@/../public/WasmModule.js';
import Wasm from "@/../public/WasmModule.wasm";
import PixiRenderer from "@/code/PixiRenderer";
import WasmExpressor from "@/components/WasmExpressor.vue";
import Functions from "@/code/Functions";
import Store from "@/models/Store";
import DeadStore from "@/models/DeadStore";

@Component({
  components: {WasmExpressor},
})
export default class WasmTest extends Vue {
  fake = null;
  project = null;
  store: any = null;

  @Provide()
  saveStoreFunctor = () => this.saveStore();

  async mounted() {
    const module = await WasmModule({
      locateFile: (path) => {
        if (path.endsWith('.wasm')) {
          return Wasm;
        }
        return path;
      },
    });
    (window as any).wasmModule = module;

    function render(project, renderer) {
      const evalOutput = project.evalOrganismTree();
      renderer.render(evalOutput);
      evalOutput.delete();
      window.requestAnimationFrame(() => render(project, renderer));
    }

    const renderer = new PixiRenderer(this.$refs['viewport'], this.$refs['canvas']);

    // const store = new Store(module);
    // const project = store.addProject();
    // const attributeVector = project.getRootOrganism().getAttributes();
    // const attributes = Functions.vectorToArray(attributeVector);
    // const numberNode = module.NumberNode.make(20);
    // const xAttribute = attributes[2];
    // const xRootNode = xAttribute.getRootNode();
    // xRootNode.replace(numberNode);
    // const yAttribute = attributes[3];
    // const yRootNode = yAttribute.getRootNode();
    // const refNode = module.AttributeReferenceNode.makeUnique(xAttribute);
    // yRootNode.replace(refNode);
    //
    // const deadStore = DeadStore.fromLiveStore(store);
    // const liveStore = DeadStore.toLiveStore(deadStore, module);
    // const dead2 = DeadStore.fromLiveStore(liveStore);
    // console.log(JSON.stringify(dead2));
    // const liveProject = liveStore.projects[0];
    // this.project = liveProject;

    const store = Store.loadOrMake(module);
    this.store = store;
    this.project = store.getProjects()[0];
    const project: any = this.project;
    // const rootOrganism = project.getRootOrganism();
    // const attributes = Functions.vectorToArray(rootOrganism.getAttributes());
    // const attribute = attributes[2];
    // const twoNode = module.NumberNode.makeUnique(2);
    // const threeNode = module.NumberNode.makeUnique(3);
    // const addNode = module.AddOpNode.makeUnique(twoNode, threeNode);
    // const oneNode = module.NumberNode.makeUnique(1);
    // twoNode.replace(oneNode);
    // attribute.setRootNode(addNode);

    render(this.project, renderer);
  }

  private saveStore() {
    this.store.save();
  }
}

</script>
<style scoped>
</style>