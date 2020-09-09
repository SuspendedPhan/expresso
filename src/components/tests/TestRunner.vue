<template>
  <div>
    <div v-for='test in store.tests' :key='test.name'>
      <span>{{ test.status }}</span>
      <span>{{ test.name }}</span>
    </div>
  </div>
</template>

<script>
import * as TestRunner from './TestRunner.js';
import { Store } from './TestRunner.js';
import './Tests';

export default {
  name: 'TestRunner',
  props: {
  },
  data: () => {
    return {
      store: Store,
    };
  },
  mounted: function() {
    for (const test of TestRunner.getTests()) {
      TestRunner.runTests();
    }
  }
}
</script>

<style scoped>
</style>
