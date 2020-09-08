<template>
  <div id='viewport' class='viewport'>
  </div>
</template>

<script>
import Two from 'two.js';
import Store from '../code/Store';
import Node from '../code/Node';
import Gets from '../code/Gets';
import Actions from '../code/Actions';

export default {
  name: 'TestRunner',
  props: {
  },
  data: () => {
    return {};
  },
  mounted: () => {
    
  }
}
</script>

<style scoped>
.viewport {
  border-color: black;
  border-style: solid;
  border-width: 1px;
  height: 50vh;
}
</style>
