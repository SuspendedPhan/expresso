<template>
  <div class="absolute border border-black">
    <input class='input bg-transparent' ref="input" @blur='blur' @keydown='keydown' :value="query" @input="onInput" />
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
import {Prop} from "vue-property-decorator";
import Vue from "vue";

@Component({

})
export default class Searchbox extends Vue {
  @Prop() choices;
  @Prop() query;

  mounted() {
  }

  onClick(choice, event) {
    this.emitChoiceCommitted(choice);
  }

  onInput(event) {
    this.$emit('queryInput', event);
  }

  keydown(event) {
    if (event.key === 'Enter' && this.choices.length > 0) {
      this.emitChoiceCommitted(this.choices[0]);
    }
  }

  private emitChoiceCommitted(choice) {
    this.$emit('choiceCommitted', choice);
  }

  focus() {
    (this.$refs['input'] as any).focus();
  }

  blur() {
    this.$emit('blur');
  }
}
</script>
<style scoped>
</style>