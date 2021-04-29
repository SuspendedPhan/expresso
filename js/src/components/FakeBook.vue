<template>
  <div>
    <input :value="value" @input="onChange" />
    <div>{{value}}</div>
    <button @click="add">Add</button>
    <button @click="remove">Remove</button>
    <FakeBook class="px-8" v-for="child in children" :fake="child" :key="child.getId()"></FakeBook>
  </div>
</template>

<script lang="ts">

import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import Vue from "vue";

import WasmModule from '@/../public/WasmModule.js';
import Wasm from "@/../public/WasmModule.wasm";
import PixiRenderer from "@/code/PixiRenderer";

@Component({
  components: {},
})
export default class FakeBook extends Vue {
  @Prop()
  fake;

  value = 'new guy';
  children = [];

  mounted() {
    const module = window.wasmModule;
    this.fake.subscribeOnValueChanged(() => {
      this.value = this.fake.getValue();
    });
    this.fake.subscribeOnChildrenChanged(() => {
      const children = this.fake.getChildren();
      const jsChildren = [];
      for (let i = 0; i < children.size(); i++) {
        jsChildren.push(children.get(i));
      }
      this.children = jsChildren;
    });
  }

  onChange(event) {
    this.fake.setValue(event.target.value);
  }

  add() {
    this.fake.addChild();
  }

  remove() {
    this.fake.remove();
  }
}
</script>