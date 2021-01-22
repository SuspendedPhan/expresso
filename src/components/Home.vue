<template>
  <div class='home'>
    <!-- <Expressor class='expressor' v-if='showExpressor' /> -->
    <!-- <Viewport :class='["viewport", { fullWidth: !showExpressor }]' /> -->
    <TestRunner v-if='false' class='runner'/>
    <button class='flick' @click='showExpressor = !showExpressor'>Flick</button>
    <D3TestPage></D3TestPage>
  </div>
</template>

<script>
import Viewport from './Viewport';
import Expressor from './Expressor';
import D3TestPage from './D3TestPage';
import TestRunner from './tests/TestRunner.vue';
import Root from "../store/Root";
import Vue from "vue";

export default {
  name: 'Home',
  components: {
    Viewport,
    Expressor,
    TestRunner,
    D3TestPage
  },
  props: {
  },
  data: function() {
    return {
      showExpressor: true,
    };
  },
  mounted() {
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
  }
}
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
  grid-template-columns: 33% 1fr;
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
}
.expressor {
  /* margin-top: 40px; */
  /* margin-left: 40px; */
  /* border: 1px solid black; */
  padding: 20px;
  overflow-x: auto;
  overflow-y: scroll;
}
.flick {
  position: absolute;
  bottom: 10px;
  left: 10px;
}
.fullWidth {
  grid-column: 1 / -1;
}
</style>