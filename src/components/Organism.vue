<template>
  <div v-if='organism' class='organism'>
    <div class='organism-name'>{{ organism.name }}</div>
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
    <div class='attribute-group'>
      <div class='attribute' v-for='(attribute, index) in root.attributeStore.getEditables(organism)' :key='attribute.id'>
        <div v-if='index !== 0' class='divider'></div>
        <span class='attribute-name'>{{ attribute.name }}: </span>
        <Attribute :attributeModel='attribute' />
      </div>
    </div>
    <Organism class='organ' v-for='organ in root.organismCollection.getChildren(organism)' :key='organ.id' :organism='organ'>
    </Organism>
  </div>
</template>

<script>
import wu from 'wu';
import Root from '../store/Root';
import Attribute from './Attribute';

export default {
  name: 'Organism',
  components: {
    Attribute,
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
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 20px;
  border-radius: 2px;
  margin-top: 10px;
}
.controls {
  display: grid;
  grid-template-columns: max-content max-content;
  gap: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
}
.attribute-group {
  display: grid;
  grid-auto-rows: auto;
  /* gap: 10px; */
}
.attribute-name {
  color: rgba(113, 0, 225, 0.7);
  font-weight: 500;
}
.divider {
  border-bottom: 2px solid rgba(0, 0, 0, .2);
  margin-bottom: 20px;
  margin-top: 10px;
}
.organism-name {
  color: #4DC47D;
  font-weight: 500;
  font-size: 24px;
}
</style>
