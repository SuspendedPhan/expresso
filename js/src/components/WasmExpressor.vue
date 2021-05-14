<template>
  <div>
    <WasmOrganism class="p-8" :organism="tree.getRootOrganism()"></WasmOrganism>
  </div>
</template>

<script lang="ts">

import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import Vue from "vue";
import WasmOrganism from "@/components/WasmOrganism.vue";
import {OrganismLayout} from "@/store/OrganismLayout";

@Component({
  components: {WasmOrganism}
})
export default class WasmExpressor extends Vue {
  @Prop()
  tree;

  rootOrganism = null;
  organismLayout = new OrganismLayout();

  async mounted() {
    this.rootOrganism = this.tree.getRootOrganism();
  }
}

</script>
<style scoped>
</style>