<template>
  <div ref="expressor">
    <Organism :organism="root.organismCollection.getRoot()" :isRoot="true" />
    <div class="bottom-group">
      <button @click="clearStorage">Clear storage</button>
      <div :class="['error-box', { error: consoleError }]">
        you have console errors
      </div>
    </div>
  </div>
</template>

<script>
import { PenPositionRelation } from "@/store/Pen";
import wu from "wu";
import Root from "../store/Root";
import Node from "./Node";
import Organism from "./Organism";
import Vue from "vue";
import panzoom from "panzoom";
// import CodeMirror from 'codemirror';

export default {
  name: "Expressor",
  components: {
    // Node,
    Organism,
  },
  props: {},
  data: function () {
    return {
      root: Root,
      attributeStore: Root.attributeStore,
      metaorganismCollection: Root.metaorganismCollection,
      selectedPrimitiveId: Root.metaorganismCollection.getMetaorganisms()[0].id,
      consoleError: false,
    };
  },
  computed: {},
  methods: {
    getNodeForAttribute: function (attribute) {
      return Root.nodeStore.getChild(
        Root.attributeStore.getRootNode(attribute),
        0
      );
    },
    spawn: function () {
      const metaorganism = this.metaorganismCollection.getFromId(
        this.selectedPrimitiveId
      );
      this.root.organismCollection.putFromMeta(undefined, metaorganism);
      this.root.save();
    },
    clearStorage: function () {
      this.root.clearStorage();
    },
    removeOrganism: function (organism) {
      this.root.organismCollection.remove(organism);
      this.root.save();
    },
  },
  mounted() {
    const pz = panzoom(this.$refs["expressor"], {
      beforeMouseDown: function (e) {
        var shouldIgnore = !e.altKey;
        return shouldIgnore;
      },
      filterKey: function (/* e, dx, dy, dz */) {
        // don't let panzoom handle this event:
        return true;
      },
      zoomDoubleClickSpeed: 1,
    });
  },
};
</script>

<style scoped>
.organism {
  margin-bottom: 20px;
}
.attribute {
}
.controls {
  display: grid;
  grid-template-columns: max-content max-content max-content;
  gap: 10px;
}
.bottom-group {
  display: flex;
  justify-content: space-between;
}
.error-box {
  padding: 5px;
  font-size: 12px;
  background-color: hsl(0, 100%, 67%);
  visibility: hidden;
  color: white;
}
.error-box.error {
  visibility: visible;
}
</style>
