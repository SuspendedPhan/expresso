<template>
  <div class="WatLine" v-if="childCards.length > 0">
    <div class="line" ref="horizontal" v-show="childCards.length > 1"></div>
    <div class="line" ref="vertical"></div>
    <div
      class="line"
      ref="verticalChild"
      v-for="child in childCards"
      :key="child.id"
      :id="'line' + child.id"
    ></div>
  </div>
</template>

<script>
import Viewport from "./Viewport";
import Expressor from "./Expressor";
import TestRunner from "./tests/TestRunner.vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import Vue from "vue";

@Component()
export default class WatLine extends Vue {
  @Prop() cardId;
  @Prop() node;

  mounted() {
    const that = this;
    setTimeout(() => that.upper(), 200);
  }

  upper() {
    if (this.childCards.length === 0) return;

    const leftRect = this.childCards[0].getBoundingClientRect();
    const rightRect = this.childCards[
      this.childCards.length - 1
    ].getBoundingClientRect();

    const left = (leftRect.left + leftRect.right) / 2;
    const right = (rightRect.left + rightRect.right) / 2;
    const horizontal = this.$refs["horizontal"];
    horizontal.style.left = left + "px";
    horizontal.style.width = right - left + "px";

    const topRect = this.card.getBoundingClientRect();
    const topCenter = (topRect.left + topRect.right) / 2;
    const top = topRect.bottom;
    const height = (leftRect.top - topRect.bottom) / 2;
    const vertical = this.$refs["vertical"];
    vertical.style.top = top + "px";
    vertical.style.height = height + "px";

    for (const childCard of this.childCards) {
      const line = document.getElementById("line" + childCard.id);
      const childRect = childCard.getBoundingClientRect();
      const x = (childRect.left + childRect.right) / 2;
      const top = topRect.bottom + height;
      line.style.left = x + "px";
      line.style.top = top + "px";
      line.style.height = height + "px";
    }
  }

  get card() {
    return document.getElementById(this.cardId);
  }

  get childCards() {
    if (!this.node) return [];

    const cardIds = this.node.cardIds();
    const ret = [];
    for (const cardId of cardIds) {
      ret.push(document.getElementById(cardId));
    }

    return ret;
  }
}
</script>
<style scoped>
.line {
  border: 1px solid rgba(180, 170, 135, 0.6);
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.2);
  position: absolute;
}
</style>