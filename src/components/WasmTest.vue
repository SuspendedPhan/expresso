<template>
  <div>
  </div>
</template>

<script lang="ts">

import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import Vue from "vue";
import {AsBind} from "as-bind";
import MyWorker from "worker-loader!../workers/MyWorker";
import loader from "@assemblyscript/loader"; // or require

@Component({
  components: {},
})
export default class WasmTest extends Vue {
  async mounted() {
    console.log("'adsfdf");
    const memory = new WebAssembly.Memory({
      initial: 1,
      maximum: 100,

      // @ts-ignore
      shared: true
    });

    const wasm = fetch("/build/optimized.wasm");
    const {exports} = await loader.instantiate(wasm, {env: {memory}});
    const {Ast, EvalOutput} = exports;

    Ast.setClones(30);

    const worker0 = new MyWorker();
    console.log(Ast.getClones());
    const worker1 = new MyWorker();
    const worker2 = new MyWorker();

    worker0.postMessage({memory});
    worker1.postMessage({memory});
    worker2.postMessage({memory});

    worker0.postMessage({startIndex: 0, postEndIndex: 1});
    // worker1.postMessage({startIndex: 10, postEndIndex: 20});
    // worker2.postMessage({startIndex: 20, postEndIndex: 30});

    const promises: any = [];
    const resolves = new Array(3);
    promises.push(new Promise((resolve) => resolves[0] = resolve));
    promises.push(new Promise((resolve) => resolves[1] = resolve));
    promises.push(new Promise((resolve) => resolves[2] = resolve));
    worker0.onmessage = (event) => {
      console.log('main receive message 0: ' + JSON.stringify(event.data));
      console.log(Ast.getClones());
      resolves[0]();
      // for (let i = 0; i < Ast.getClones(); i++) {
      //   console.log("radius: " + EvalOutput.getRadius(i));
      // }
      if (event.data === 'done') {
        worker0.postMessage({getClones: true});
        console.log(memory);
      }
    }

    worker1.onmessage = (event) => {
      console.log('main receive message 1');
      resolves[1]();
    }

    worker2.onmessage = (event) => {
      console.log('main receive message 2');
      resolves[2]();
    }
    Promise.all(promises).then(() => {
      console.log('yay!');
    });
  }
}

// class EvalResult {
//   resultArrayBufferFloat32: ArrayBuffer;
//
//   getResult(organism, cloneNumber, attribute) {
//
//   }
//
//   setResult(organism, cloneNumber, attribute) {
//
//   }
// }

</script>
<style scoped>
</style>