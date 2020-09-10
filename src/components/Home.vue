<template>
  <div>
    <Viewport />
    <Expressor />
    <TestRunner class='runner'/>
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
  position: absolute;
}
</style>