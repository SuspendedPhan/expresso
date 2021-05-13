<template>
  <div>
    <div>{{ name }}</div>
    <div class="pl-8">
      <WasmAttribute v-for="attribute of attributes" :attribute="attribute" :key="attribute"></WasmAttribute>
      <WasmOrganism v-for="suborganism of suborganisms" :organism="suborganism" :key="suborganism"></WasmOrganism>
    </div>
  </div>
</template>

<script lang="ts">

import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import Vue from "vue";
import WasmAttribute from "./WasmAttribute.vue";
import Functions from "@/code/Functions";

@Component({
  components: {WasmAttribute}
})
export default class WasmOrganism extends Vue {
  @Prop()
  organism;

  name = null;
  suborganisms = [];
  attributes = [];

  async mounted() {
    this.name = this.organism.getName();
    this.suborganisms = Functions.vectorToArray(this.organism.getSuborganisms());
    this.attributes = Functions.vectorToArray(this.organism.getAttributes());
  }
}

</script>
<style scoped>
</style>