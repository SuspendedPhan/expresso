<template>
  <div class="flex">
    <WasmExpressor class="w-1/2 h-full" v-if="project" :project="project"></WasmExpressor>
    <div ref="viewport" class="h-full w-1/2">
      <canvas ref="canvas"></canvas>
    </div>
    <ProjectFunctionCollection v-if="project" :project="project" />
  </div>
</template>

<script lang="ts">

import Component from "vue-class-component";
import {Provide} from "vue-property-decorator";
import Vue from "vue";

import WasmModule from '@/../public/WasmModule.js';
import Wasm from "@/../public/WasmModule.wasm";
import PixiRenderer from "@/code/PixiRenderer";
import WasmExpressor from "@/components/WasmExpressor.vue";
import Functions from "@/code/Functions";
import Store from "@/models/Store";
import DeadStore from "@/models/DeadStore";
import ProjectFunctionCollection from "@/components/ProjectFunctionCollection.vue";
import WasmPen from "@/code/WasmPen";

@Component({
  components: {ProjectFunctionCollection, WasmExpressor},
})
export default class WasmTest extends Vue {
  fake = null;
  project = null;
  store: any = null;
  emModule: any = null;

  @Provide()
  saveStoreFunctor = () => this.saveStore();

  @Provide()
  getEmModule = () => this.privateGetEmModule();

  @Provide()
  pen = new WasmPen();

  privateGetEmModule() {
    return this.emModule;
  }

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
    this.emModule = module;

    function render(project, renderer) {
      const evalOutput = project.evalOrganismTree();
      renderer.render(evalOutput);
      evalOutput.delete();
      window.requestAnimationFrame(() => render(project, renderer));
    }

    const renderer = new PixiRenderer(this.$refs['viewport'], this.$refs['canvas']);

    // const store = new Store(module);
    // this.store = store;
    // const project = store.addProject();
    // const attributeVector = project.getRootOrganism().getAttributes();
    // const attributes = Functions.vectorToArray(attributeVector);
    // const numberNode = module.NumberNode.makeUnique(20);
    // const xAttribute = attributes[2];
    // const xRootNode = xAttribute.getRootNode();
    // // xRootNode.replace(numberNode);
    // const yAttribute = attributes[3];
    // const yRootNode = yAttribute.getRootNode();
    // const refNode = module.AttributeReferenceNode.makeUnique(xAttribute);
    // // yRootNode.replace(refNode);

    // const deadStore = DeadStore.fromLiveStore(store);
    // // console.log(JSON.stringify(deadStore));
    // const liveStore = DeadStore.toLiveStore(deadStore, module);
    // const dead2 = DeadStore.fromLiveStore(liveStore);
    // // console.log(JSON.stringify(dead2));
    // const liveProject = liveStore.projects[0];
    // this.project = liveProject;

    const store = Store.makeDefault(module);
    // const store = Store.loadOrMake(module);
    this.store = store;
    this.project = store.getProjects()[0];
    const project: any = this.project;
    // const rootOrganism = project.getRootOrganism();
    // const attributes = Functions.vectorToArray(rootOrganism.getAttributes());
    // const xAttribute = attributes[2];
    // const yAttribute = attributes[3];

    const aParameter = module.FunctionParameter.makeUnique("a");
    const bParameter = module.FunctionParameter.makeUnique("b");
    const aParameterNode = module.ParameterNode.makeUnique(aParameter);
    const bParameterNode = module.ParameterNode.makeUnique(bParameter);
    const addNode = module.AddOpNode.makeUnique(aParameterNode, bParameterNode);
    const twoNode = module.NumberNode.makeUnique(2);
    const divNode = module.DivOpNode.makeUnique(addNode, twoNode);
    const fun = module.Function.makeUnique("Average", divNode);
    fun.addParameter(aParameter);
    fun.addParameter(bParameter);
    project.addFunction(fun);
    //
    // const aArgNode = module.NumberNode.makeUnique(25);
    // const bArgNode = module.NumberNode.makeUnique(75);
    // const callNode = module.FunctionCallNode.makeUnique(fun);
    // callNode.setArgument(aParameter, aArgNode);
    // callNode.setArgument(bParameter, bArgNode);
    // xAttribute.setRootNode(callNode);
    //
    // yAttribute.setRootNode(module.NumberNode.makeUnique(50));

    // const threeNode = module.NumberNode.makeUnique(3);
    // const addNode = module.AddOpNode.makeUnique(twoNode, threeNode);
    // const oneNode = module.NumberNode.makeUnique(1);
    // twoNode.replace(oneNode);
    // xAttribute.setRootNode(addNode);

    render(this.project, renderer);
  }

  private saveStore() {
    this.store.save();
  }
}

</script>
