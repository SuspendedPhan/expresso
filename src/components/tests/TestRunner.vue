<template>
  <div class="test-runner">
    <div v-for="test in store.tests" :key="test.name" class="flex">
      <span>{{ test.status }}</span>
      <span>{{ test.name }}</span>
    </div>
  </div>
</template>

<script>
import * as TestRunner from './TestRunner'
import { Store } from './TestRunner'
import './Tests'

export default {
  name: 'TestRunner',
  props: {},
  data: () => {
    return {
      store: Store
    }
  },
  mounted: function () {
    TestRunner.runTests()
  }
}
</script>

<style scoped>
.flex {
  display: grid;
  grid-template-columns: max-content max-content;
  gap: 20px;
}
.test-runner {
  background-color: white;
}
</style>
