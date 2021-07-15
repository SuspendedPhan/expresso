<template>
  <div>
    <div>{{framerate}}</div>
    <div class="flex">
      <div class="w-1/2 h-full">
        <WasmExpressor v-if="project" :project="project"></WasmExpressor>
        <ProjectFunctionCollection v-if="projectFunctionsActive" :project="project" class="absolute bg-white border p-4 m-4 shadow-md border-black" />
      </div>
      <div ref="viewport" class="h-full w-1/2">
        <canvas ref="canvas"></canvas>
      </div>
    </div>
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
import fps from "fps";
import numeral from "numeral";
import GlobalToggle from "@/components/GlobalToggle.vue";
import hotkeys from "hotkeys-js";

@Component({
  components: {ProjectFunctionCollection, WasmExpressor },
})
export default class WasmTest extends Vue {
  fake = null;
  project = null;
  store: any = null;
  emModule: any = null;
  framerate = '';

  @Provide()
  saveStoreFunctor = () => this.saveStore();

  @Provide()
  getEmModule = () => this.privateGetEmModule();

  @Provide()
  pen = new WasmPen();

  private projectFunctionsActive = false;

  privateGetEmModule() {
    return this.emModule;
  }

  ticker = fps({ every: 10 });

  created() {
    this.ticker.on(
        "data",
        (framerate) => (this.framerate = numeral(framerate).format("0"))
    );
    hotkeys('alt+f', (event) => {
      this.projectFunctionsActive = !this.projectFunctionsActive;
      event.preventDefault();
    });
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

    const render = (project, renderer) => {
      this.ticker.tick();
      const evalContext = this.emModule.EvalContext.makeUnique();
      const timeAttribute = Functions.getAttributeByName(Functions.vectorToIterable(project.getRootOrganism().getAttributes()), "time");
      const time = performance.now() / 1000;
      evalContext.setValue(timeAttribute, time);

      const evalOutput = project.evalOrganismTree(evalContext);
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

    WasmTest.addAverageFunction(module, project);

    // const deadStore = DeadStore.fromLiveStore(store);
    // const liveStore = DeadStore.toLiveStore(deadStore, this.emModule);
    // this.project = liveStore.getProjects()[0];

    render(this.project, renderer);
  }

  private static addAverageFunction(module: any, project: any) {
    const aParameter = module.FunctionParameter.makeUnique("a");
    const bParameter = module.FunctionParameter.makeUnique("b");
    const aParameterNode = module.ParameterNode.makeUnique(aParameter);
    const bParameterNode = module.ParameterNode.makeUnique(bParameter);

    const primitiveFunctions = Functions.vectorToArray(module.PrimitiveFunctionCollection.getInstance().getFunctions());
    const addFunction = primitiveFunctions.find(t => t.getName() === "+");
    console.log(primitiveFunctions);
    console.log(addFunction);
    const addNode = module.PrimitiveFunctionCallNode.makeUnique(addFunction);
    const parameters = Functions.vectorToArray(addFunction.getParameters().getAll());
    addNode.getArgumentCollection().setArgument(parameters[0], aParameterNode);
    addNode.getArgumentCollection().setArgument(parameters[1], bParameterNode);

    const twoNode = module.NumberNode.makeUnique(2);
    const divNode = module.DivOpNode.makeUnique(addNode, twoNode);
    const fun = module.Function.makeUnique("Average");
    fun.setRootNode(divNode);
    fun.addParameter(aParameter);
    fun.addParameter(bParameter);
    project.addFunction(fun);
  }

  private saveStore() {
    this.store.save();
  }
}

</script>
