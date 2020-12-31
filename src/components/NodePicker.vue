<template>
<div class='node-picker'>
  <input class='input' ref="input" @blur='blur' @keydown='keydown' v-model='query' />
  <div class='divider'></div>
  <div>
    <div v-for='(suggestion, index) in suggestions' :key='index' class='suggestion' @mousedown='onClick(suggestion, $event)'>
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
        }

        this.blur();
        event.preventDefault();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        this.blur();
      }
    },
    focus() {
      this.$refs['input'].focus();
    },
    blur() {
      Root.pen.setIsQuerying(false);
      this.$emit('blur');
    },
    onClick(suggestion, event) {
      Root.pen.commitGhostEdit(suggestion);
      event.preventDefault();
      this.blur();
    }
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
  border-width: 1px;
  border-style: solid;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
  padding: 10px;
  height: 25vh;
  overflow-y: auto;
}
.suggestion {
  text-transform: lowercase;
}
.input {
  width: 100%;
  outline: none;
  border: none;
}
.suggestion:hover {
  background-color: #a8d1ff;
}
.divider {
  border-bottom: 1px solid rgba(0, 0, 0, .2);
  margin-bottom: 10px;
  margin-top: 10px;
}
</style>
