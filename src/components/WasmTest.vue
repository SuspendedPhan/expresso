<template>
  <div>
  </div>
</template>

<script>

import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import Vue from "vue";
import {AsBind} from "as-bind";

@Component({
  components: {},
})
export default class WasmTest extends Vue {
  mounted() {
    const wasm = fetch('/wasm/optimized.wasm');
    const asyncTask = async () => {
      const asBindInstance = await AsBind.instantiate(wasm);

      const v1 = new asBindInstance.unboundExports.Vector(2, 3);
      console.log(v1.x);
    };
    asyncTask();
  }
}
</script>
<style scoped>
</style>