<template>
  <div class='home'>
    <Expressor class='expressor' v-if='showExpressor' />
    <Viewport :class='["viewport", { fullWidth: !showExpressor }]' />
    <TestRunner v-if='false' class='runner'/>
    <button class='flick' @click='showExpressor = !showExpressor'>Flick</button>
  </div>
</template>

<script>
import Viewport from './Viewport';
import Expressor from './Expressor';
import TestRunner from './tests/TestRunner.vue';

export default {
  name: 'Home',
  components: {
    Viewport,
    Expressor,
    TestRunner,
  },
  props: {
  },
  data: function() {
    return {
      showExpressor: true,
    };
  },
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
  gap: 20px;
  /* padding: 20px; */
}
.viewport {
  /* margin: 20px; */
  /* border-color: black;
  border-style: solid;
  border-width: 1px; */
}
.expressor {
  margin-top: 40px;
  margin-left: 40px;
  /* border: 1px solid black; */
  padding: 20px;
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