<template>
  <div class="absolute border border-black">
    <input class='input' ref="input" @blur='blur' @keydown='keydown' v-model='query' />
    <div class='border border-solid'></div>
    <div>
      <div v-for='(choice, index) in choices' :key='index' @mousedown='onClick(choice, $event)'>
        {{ choice.text }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import Component from "vue-class-component";
import {Inject, Prop} from "vue-property-decorator";
import Vue from "vue";

@Component({

})
export default class Searchbox extends Vue {
  @Prop() choices;

  query = '';

  mounted() {
  }

  onClick() {

  }

  keydown() {

  }

  blur() {
    this.$emit('blur');
  }
}
</script>
<style scoped>
</style>