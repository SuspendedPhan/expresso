<template>
  <div class='home'>
    <Expressor class='expressor' />
    <Viewport class='viewport' />
    <TestRunner v-if='true' class='runner'/>
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
  grid-template-columns: 33% 50%;
  grid-template-rows: 100%;
  height: 100%;
  width: 100%;
  overflow: hidden;

}
.viewport {
  margin: 20px;
}
.expressor {
  margin: 20px;
  border: 1px solid black;
  padding: 20px;
}
</style>