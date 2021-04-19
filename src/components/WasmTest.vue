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
    const module = WasmModule({
      locateFile(path) {
        if (path.endsWith('.wasm')) {
          return Wasm;
        }
        return path;
      }
    });

    // module.onRuntimeInitialized = () => {
    //   // console.log(module.sayHello());
    // };
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