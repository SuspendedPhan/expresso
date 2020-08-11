<template>
<div>
  <input ref="input" @blur='blur' @keydown='keydown' v-model='searchText' />
  <div v-for='(result, index) in results' :key='index'>
    {{ result.text }}
  </div>
</div>
</template>

<script>
import MetaNodes, { MetaNodeList } from '../code/MetaNodes';

export default {
  name: 'Search',
  props: {
  },
  data: () => {
    return {
      searchText: '',
    };
  },
  methods: {
    keydown(event) {
      if (event.key === 'Enter' && this.results.length > 0) {
        this.$emit('metaNodeSelected', this.results[0]);
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
      const metaNodes = MetaNodeList.filter(metaNode => metaNode.name.toLowerCase().includes(this.searchText.toLowerCase()));
      const answer = metaNodes.map(metaNode => ({
        metaNode: metaNode,
        text: metaNode.name.toLowerCase(),
      }));

      const number = Number.parseFloat(this.searchText);
      if (!Number.isNaN(number)) {
        answer.push({
          metaNode: MetaNodes.Number,
          text: number,
          params: [number],
        })
      }
      return answer;
    }
  }
}
</script>

<style scoped>
</style>
