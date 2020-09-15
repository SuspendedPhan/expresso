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
    Root.load();
    document.addEventListener('keydown', event => {
      if (event.key === 'ArrowUp' && !Root.penStore.getIsQuerying()) {
        Root.penStore.moveCursorUp();
      } else if (event.key === 'ArrowDown' && !Root.penStore.getIsQuerying()) {
        Root.penStore.moveCursorDown();
      }

      if (Root.penStore.getPointedNode() !== null) {
        if (event.key === 'Enter') {
          Root.penStore.setIsQuerying(true);
        } else if (event.key === 'ArrowLeft' && !Root.penStore.getIsQuerying()) {
          Root.penStore.moveCursorLeft();
        } else if (event.key === 'ArrowRight' && !Root.penStore.getIsQuerying()) {
          Root.penStore.moveCursorRight();
        } else if (event.key === 'Escape' && Root.penStore.getIsQuerying()) {
          Root.penStore.setIsQuerying(false);
        }
      }
    });
  }
}
</script>

<style scoped>
</style>
