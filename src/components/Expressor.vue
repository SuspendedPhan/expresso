<template>
  <div>
    <div v-for='attribute in attributes' :key='attribute.id'>
      <span>{{ attribute.name }}: </span>
      <Node :astNode='getNodeForAttribute(attribute)' />
    </div>
  </div>
</template>

<script>
import wu from 'wu';
import Root from '../store/Root';
import Node from './Node';

export default {
  name: 'Expressor',
  components: {
    Node,
  },
  props: {
  },
  data: function() {
    return {
      // Root: Root,
      attributeStore: Root.attributeStore,
    };
  },
  computed: {
    attributes: function() {
      const organism = Root.organismStore.getFromName('circle');
      return Root.attributeStore.getAttributesForOrganism(organism)
          .filter(attr => attr.attributeType === 'Editable')
          .toArray();
    }
  },
  methods: {
    getNodeForAttribute: function(attribute) {
      return Root.nodeStore.getChild(Root.attributeStore.getRootNode(attribute), 0);
    }
  },
  mounted() {
    // Actions.load(this.store);
    document.addEventListener('keydown', event => {
      if (Root.penStore.getPointedNode() === null) return;
      if (event.key === 'Enter') {
        Root.penStore.setIsQuerying(true);
      } else if (event.key === 'ArrowLeft' && !Root.penStore.getIsQuerying()) {
        Root.penStore.moveCursorLeft();
      } else if (event.key === 'ArrowRight' && !Root.penStore.getIsQuerying()) {
        Root.penStore.moveCursorRight();
      }
    });
  }
}
</script>

<style scoped>
</style>
