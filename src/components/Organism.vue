<template>
  <div v-if='organism' class='organism'>
    <div>{{ organism.name }}</div>
    <div class='controls'>
      <select v-model='selectedPrimitiveId'>
        <option v-for='metaorganism in metaorganismCollection.getMetaorganisms()' :key='metaorganism.id' :value='metaorganism.id'>
          {{ metaorganism.name }}
        </option>
      </select>
      <button @click='spawn'>Spawn Organ</button>
      <input placeholder='Attribute name' v-model='attributeName' />
      <button @click='addAttribute'>Add Attribute</button>
      <button @click='removeOrganism(organism)' v-if='!isRoot'>Remove Organism</button>
    </div>
    <div class='attribute' v-for='attribute in root.attributeStore.getEditables(organism)' :key='attribute.id'>
      <span>{{ attribute.name }}: </span>
      <Node :astNode='getNodeForAttribute(attribute)' />
    </div>
    <Organism class='organ' v-for='organ in root.organismCollection.getChildren(organism)' :key='organ.id' :organism='organ'>
    </Organism>
  </div>
</template>

<script>
import wu from 'wu';
import Root from '../store/Root';
import Node from './Node';

export default {
  name: 'Organism',
  components: {
    Node,
  },
  props: {
    organism: null,
    isRoot: Boolean,
  },
  data: function() {
    return {
      root: Root,
      attributeStore: Root.attributeStore,
      metaorganismCollection: Root.metaorganismCollection,
      selectedPrimitiveId: Root.metaorganismCollection.getMetaorganisms()[0].id,
      attributeName: '',
    };
  },
  computed: {
  },
  methods: {
    getNodeForAttribute: function(attribute) {
      Root.nodeCollection.nodeParents.length;  // trigger reactive
      return Root.nodeStore.getChild(Root.attributeStore.getRootNode(attribute), 0);
    },
    spawn: function () {
      const metaorganism = this.metaorganismCollection.getFromId(this.selectedPrimitiveId);
      const organ = this.root.organismCollection.putFromMeta(this.root.wordCollection.getRandomWord(), metaorganism);
      this.root.organismCollection.addChild(this.organism, organ);
      this.root.save();
    },
    addAttribute: function() {
      const attributeName = this.attributeName === '' ? this.root.wordCollection.getRandomWord() : this.attributeName;
      this.root.attributeCollection.putEditable(this.organism, attributeName);
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
  }
}
</script>

<style scoped>
.organism {
  margin-bottom: 20px;
  border: 1px solid black;
  padding: 10px;
  border-radius: 2px;
  margin: 10px;
}
.attribute {

}
.controls {
  display: grid;
  grid-template-columns: max-content max-content;
  gap: 10px;
}
</style>
