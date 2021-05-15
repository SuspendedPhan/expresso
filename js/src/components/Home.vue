<template>
  <div class="home">
    <template v-if="!showStoreGraph">
      <template v-if="showExpressor">
        <Expressor class="expressor" v-if="oldExpressor"/>
        <WasmExpressor class="expressor" v-else-if="tree" :tree="tree"/>
      </template>
      <Viewport :class="['viewport', { fullWidth: !showExpressor }]" />
    </template>
    <StoreGraph v-else></StoreGraph>
    <TestRunner v-if="false" class="runner" />
    <button class="flick" @click="showExpressor = !showExpressor">Flick</button>
    <button class="storeGraph" @click="showStoreGraph = !showStoreGraph">
      Show Store Graph
    </button>
  </div>
</template>

<script>
import Viewport from "./Viewport";
import Expressor from "./Expressor";
import StoreGraph from "./StoreGraph";
import TestRunner from "./tests/TestRunner.vue";
import Root from "../store/Root";
import Vue from "vue";
import WasmExpressor from "@/components/WasmExpressor";
import WasmModule from "../../public/WasmModule";
import Wasm from "../../public/WasmModule.wasm";

export default {
  name: "Home",
  components: {
    WasmExpressor,
    Viewport,
    Expressor,
    TestRunner,
    StoreGraph,
  },
  props: {},
  data: function () {
    return {
      showExpressor: true,
      showStoreGraph: false,
      oldExpressor: false,
      tree: null
    };
  },
  async mounted() {
    Root.load();
    Root.organismCollection.initRootOrganism();
    document.addEventListener("keydown", (event) => {
      return;
      if (event.key === "ArrowUp" && !Root.penStore.getIsQuerying()) {
        Root.penStore.moveCursorUp();
        event.preventDefault();
      } else if (event.key === "ArrowDown" && !Root.penStore.getIsQuerying()) {
        Root.penStore.moveCursorDown();
        event.preventDefault();
      }

      if (Root.penStore.getPenPosition().positionType === "Node") {
        if (event.key === "Enter") {
          Root.penStore.setIsQuerying(true);
        } else if (
          event.key === "ArrowLeft" &&
          !Root.penStore.getIsQuerying()
        ) {
          Root.penStore.moveCursorLeft();
        } else if (
          event.key === "ArrowRight" &&
          !Root.penStore.getIsQuerying()
        ) {
          Root.penStore.moveCursorRight();
        } else if (event.key === "Escape" && Root.penStore.getIsQuerying()) {
          Root.penStore.setIsQuerying(false);
        }
      }
    });

    Root.pen.events.on("afterPenCommit", () => {
      Root.save();
    });

    Vue.config.errorHandler = (err, vm, info) => {
      this.consoleError = true;
      console.error(err);
      console.error(info);
    };

    window.addEventListener("error", () => {
      this.consoleError = true;
    });

    // --- new stuff ---

    const module = await WasmModule({
      locateFile: (path) => {
        if (path.endsWith('.wasm')) {
          return Wasm;
        }
        return path;
      },
    });

    const tree = new module.ExpressorTree();
    module.ExpressorTree.populateTestTree(tree);
    this.tree = tree;
  },
};
</script>
<style scoped>
.runner {
  bottom: 0px;
  right: 0px;
  position: absolute;
  padding: 10px;
}
.home {
  display: grid;
  position: absolute;
  grid-template-columns: 50% 1fr;
  grid-template-rows: 100%;
  height: 100%;
  width: 100%;
  /* height: calc(100% - 40px);
  width: calc(100% - 40px); */
  overflow: hidden;
  /* gap: 20px; */
  /* padding: 20px; */
}
.viewport {
  /* margin: 20px; */
  /* border-color: black;
  border-style: solid;
  border-width: 1px; */
  z-index: 1;
}
.expressor {
  overflow-x: visible;
  overflow-y: visible;
}
.flick {
  position: absolute;
  bottom: 10px;
  left: 10px;
}
.storeGraph {
  position: absolute;
  bottom: 10px;
  left: 75px;
}
.fullWidth {
  grid-column: 1 / -1;
}
</style>