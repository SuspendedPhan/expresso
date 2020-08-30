<template>
<div class='node-picker'>
  <input ref="input" @blur='blur' @keydown='keydown' v-model='searchText' />
  <div>
    <div v-for='(result, index) in results' :key='index' class='result'>
      {{ result.text }}
    </div>
  </div>
</div>
</template>

<script>
import Gets from '../code/Gets';
import Store from '../code/Store';

export default {
  name: 'NodePicker',
  props: {
    nodeToReplace: Object,
  },
  data: function() {
    return {
      searchText: '',
    };
  },
  methods: {
    keydown(event) {
      if (event.key === 'Enter' && this.results.length > 0) {
        const result = this.results[0];
        this.$emit('nodePicked', result.metanode, result.args);
        this.blur();
        event.stopPropagation();
      }
    },
    focus() {
      this.$refs['input'].focus();
    },
    blur() {
      this.$emit('blur');
    }
  },
  computed: {
    results() {
      return Array.from(Gets.nodePicks(Store, this.searchText, this.nodeToReplace));
    }
  }
}
</script>

<style scoped>
.node-picker {
  background-color: white;
  border-color: black;
  border-width: 2px;
  border-style: solid;
  /* padding: 2px; */
}
.result {
  text-transform: lowercase;
}
</style>
