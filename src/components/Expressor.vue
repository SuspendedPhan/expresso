<template>
  <div>
    <Organism :organism='root.organismCollection.getRoot()' :isRoot='true' />
     <button @click='clearStorage'>Clear storage</button>
  </div>
</template>

<script>
import wu from 'wu';
import Root from '../store/Root';
import Node from './Node';
import Organism from './Organism';

export default {
  name: 'Expressor',
  components: {
    // Node,
    Organism,
  },
  props: {
  },
  data: function() {
    return {
      root: Root,
      attributeStore: Root.attributeStore,
      metaorganismCollection: Root.metaorganismCollection,
      selectedPrimitiveId: Root.metaorganismCollection.getMetaorganisms()[0].id,
    };
  },
  computed: {
  },
  methods: {
    getNodeForAttribute: function(attribute) {
      return Root.nodeStore.getChild(Root.attributeStore.getRootNode(attribute), 0);
    },
    spawn: function () {
      const metaorganism = this.metaorganismCollection.getFromId(this.selectedPrimitiveId);
      this.root.organismCollection.putFromMeta(undefined, metaorganism);
      this.root.save();
    },
    clearStorage: function() {
      this.root.clearStorage();
    },
    removeOrganism: function(organism) {
      this.root.organismCollection.remove(organism);
      this.root.save();
    },
  },
  mounted() {
    Root.load();
    Root.organismCollection.initRootOrganism();
    document.addEventListener('keydown', event => {
      if (event.key === 'ArrowUp' && !Root.penStore.getIsQuerying()) {
        Root.penStore.moveCursorUp();
        event.preventDefault();
      } else if (event.key === 'ArrowDown' && !Root.penStore.getIsQuerying()) {
        Root.penStore.moveCursorDown();
        event.preventDefault();
      }

      if (Root.penStore.getPenPosition().positionType === 'Node') {
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
.organism {
  margin-bottom: 20px;
}
.attribute {
}
.controls {
  display: grid;
  grid-template-columns: max-content max-content max-content;
  gap: 10px;
}
</style>
