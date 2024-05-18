<template>
  <div class="Wat">
    <WatNode />
  </div>
</template>

<script>
import Viewport from "./Viewport";
import WatNode from "./WatNode";
import Expressor from "./Expressor";
import TestRunner from "./tests/TestRunner.vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import Vue from "vue";

@Component({
  components: {
    WatNode,
  },
})
export default class Wat extends Vue {
  mounted() {
    document.addEventListener("mousedown", (event) => {
      console.log(`${event.x} ${event.y}`);
    });
  }
}
</script>
<style scoped>
.Wat {
  height: 100vh;
  position: relative;
  display: grid;
}
</style>