<template>
  <div>
    <div class='organism' v-for='organism in root.organismCollection.getOrganisms()' :key='organism.id'>
      <div>{{ organism.name }}</div>
      <div class='attribute' v-for='attribute in root.attributeStore.getEditables(organism)' :key='attribute.id'>
        <span>{{ attribute.name }}: </span>
        <Node :astNode='getNodeForAttribute(attribute)' />
      </div>
      <button @click='removeOrganism(organism)'>Remove</button>
    </div>
    <div class='controls'>
      <select v-model='selectedPrimitiveId'>
        <option v-for='metaorganism in metaorganismCollection.getMetaorganisms()' :key='metaorganism.id' :value='metaorganism.id'>
          {{ metaorganism.name }}
        </option>
      </select>
      <button @click='spawn'>Spawn Organism</button>
      <button @click='clearStorage'>Clear storage</button>
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
