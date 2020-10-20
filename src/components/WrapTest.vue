<template>
  <div class="WrapTest">
    <textarea ref='textarea'>radius: tri(mod01(add(time, cloneNumber01), 50))</textarea>
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
import CodeMirror from 'codemirror';

@Component({
  components: {
  },
})
export default class WrapTest extends Vue {
  mounted() {
    // var myCodeMirror = CodeMirror.fromTextArea(this.$refs.textarea);
  }
}
</script>
<style scoped>
.WrapTest {
  height: 100vh;
  position: relative;
  display: grid;
}
</style>