<template>
<div class='node-picker'>
  <input ref="input" @blur='blur' @keydown='keydown' v-model='query' />
  <div>
    <div v-for='(suggestion, index) in suggestions' :key='index' class='suggestion'>
      {{ suggestion.text }}
    </div>
  </div>
</div>
</template>

<script>
import Root from '../store/Root';
import Store from '../store/Root';

export default {
  name: 'NodePicker',
  data: function() {
    return {
      searchText: '',
      Root: Root,
      nodeStore: Root.nodeStore,
      penStore: Root.penStore,
    };
  },
  methods: {
    keydown(event) {
      if (event.key === 'Enter' && this.suggestions.length > 0) {
        if (Root.penStore.getQuery() !== '') {
          const result = this.suggestions[0];
          Root.penStore.commitGhostEdit(result);
          Root.save();
        }
        
        Root.penStore.setIsQuerying(false);
        this.blur();
        event.stopPropagation();
      }
    },
    focus() {
      this.$refs['input'].focus();
    },
    blur() {
      this.$emit('blur');
    },
  },
  computed: {
    suggestions() {
      return Array.from(Root.penStore.getGhostEdits());
    },
    query: {
      get: function() {
        return Root.penStore.getQuery();
      },
      set: function(query) {
        Root.penStore.setQuery(query);
      }
    },
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
.suggestion {
  text-transform: lowercase;
}
</style>
