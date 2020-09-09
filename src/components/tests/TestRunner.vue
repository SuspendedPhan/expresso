<template>
  <div>
    <div v-for='test in tests' :key='test.name'>
      {{test.name}}
    </div>
  </div>
</template>

<script>
import Tests from '../code/Tests';

export default {
  name: 'TestRunner',
  props: {
  },
  data: () => {
    return {
      tests: Tests,
    };
  },
  mounted: function() {
    for (const test of this.tests) {
      try {
        test.testFn();
      } catch {
        
      }
    }
  }
}
</script>

<style scoped>
</style>
