<template>
  <div class='Wat'>
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


@Component({components: {
  WatNode
}})
export default class Wat {
}
</script>
<style scoped>
.Wat {
  height: 100vh;
  position: relative;
  display: grid;
}
</style>