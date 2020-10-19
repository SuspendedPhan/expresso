<template>
  <div class="children">
    <div v-for="(value, key) in subroot" :key="key" class="child">
      <div class="card">{{ key }}</div>
      <WatNode :subroot="value" :name="key" />
    </div>
  </div>
</template>

<script>
import Viewport from "./Viewport";
import Expressor from "./Expressor";
import TestRunner from "./tests/TestRunner.vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";

const root = {
  "the void": {
    earth: {
      california: {
        SF: {
          "fishermans wharf": null,
        },
        SD: null,
        LA: null,
        OC: null,
      },
      georgia: {
        atlanta: null,
      },
      texas: {
        houstan: null,
        dallas: null,
      },
    },
    moon: {
      "a rock": null,
    },
  },
};

@Component()
export default class WatNode {
  @Prop({ default: () => root }) subroot;
  @Prop({ default: "the void" }) name;
}
</script>
<style scoped>
.card {
  margin: 10px;
  background: #fffcf9;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.2);
  padding: 10px;
  max-width: 100%;
  overflow: hidden;
}
.children {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  grid-template-rows: 100%;
  overflow: hidden;
}
.child {
  position: relative;
  grid-template-rows: min-content min-content;
  display: grid;
}
</style>