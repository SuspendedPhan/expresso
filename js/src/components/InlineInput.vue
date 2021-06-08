<template>
  <div>
    <div @click="startEditing" v-if="!isEditing"><slot></slot></div>
    <input
      v-else
      v-model="inputText"
      @keypress="onKeypress"
      @blur="onBlur"
      ref="nameInput"
    />
  </div>
</template>

<script lang="ts">
import Component, {Options, Vue} from "vue-class-component";
import { Prop } from "vue-property-decorator";

@Options({})
export default class InlineInput extends Vue {
  @Prop() value;
  @Prop() readonly;

  isEditing = false;
  inputText = "";

  startEditing() {
    if (!this.readonly) {
      this.inputText = this.value;
      this.isEditing = true;
      Vue.nextTick(() => this.$refs["nameInput"].focus());
    }
  }

  commit() {
    this.$emit("input", this.inputText);
    this.isEditing = false;
  }

  onKeypress(event) {
    if (event.key === "Enter") {
      this.commit();
    } else if (event.key === "Escape") {
      this.editing = false;
    }
  }

  onBlur() {
    this.commit();
  }
}
</script>

<style scoped>
</style>