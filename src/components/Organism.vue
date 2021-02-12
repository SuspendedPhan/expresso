<template>
  <div v-if="organism" class="organism" ref="organism" :style="style">
    <div class="title-bar">
      <div class="organism-name">{{ organism.name }}</div>
      <button
        v-if="!isRoot"
        width="20"
        height="20"
        class="button"
        @click="removeOrganism(organism)"
      ></button>
    </div>
    <div class="controls">
      <select v-model="selectedPrimitiveId">
        <option
          v-for="metaorganism in metaorganismCollection.getMetaorganisms()"
          :key="metaorganism.id"
          :value="metaorganism.id"
        >
          {{ metaorganism.name }}
        </option>
      </select>
      <button @click="spawn">Spawn Suborganism</button>
      <input placeholder="Attribute name" v-model="attributeName" />
      <button @click="addAttribute">Add Attribute</button>
    </div>
    <div class="attribute-group">
      <div
        class="attribute"
        v-for="(attribute, index) in root.attributeStore.getEditables(organism)"
        :key="attribute.id"
      >
        <div v-if="index !== 0" class="divider"></div>
        <span class="attribute-name">{{ attribute.name }}: </span>
        <Attribute :attributeModel="attribute" />
      </div>
    </div>
    <Organism
      class="organ"
      v-for="organ in root.organismCollection.getChildren(organism)"
      :key="organ.id"
      :organism="organ"
    >
    </Organism>
  </div>
</template>

<script>
import wu from "wu";
import Root from "../store/Root";
import Attribute from "./Attribute";
import ResizeSensor from "css-element-queries/src/ResizeSensor";
import Vue from "vue";

export default {
  name: "Organism",
  components: {
    Attribute,
  },
  props: {
    organism: null,
    isRoot: Boolean,
  },
  data: function () {
    return {
      root: Root,
      attributeStore: Root.attributeStore,
      metaorganismCollection: Root.metaorganismCollection,
      selectedPrimitiveId: Root.metaorganismCollection.getMetaorganisms()[0].id,
      attributeName: "",
      position: {
        top: 0,
        left: 0,
      },
    };
  },
  computed: {
    style: function () {
      return `left: ${this.position.left}px; top: ${this.position.top}px;`;
    },
  },
  methods: {
    getNodeForAttribute: function (attribute) {
      Root.nodeCollection.nodeParents.length; // trigger reactive
      return Root.nodeStore.getChild(
        Root.attributeStore.getRootNode(attribute),
        0
      );
    },
    spawn: function () {
      const metaorganism = this.metaorganismCollection.getFromId(
        this.selectedPrimitiveId
      );
      const organ = this.root.organismCollection.putFromMeta(
        this.root.wordCollection.getRandomWord(),
        metaorganism
      );
      this.root.organismCollection.addChild(this.organism, organ);
      this.root.save();
    },
    addAttribute: function () {
      const attributeName =
        this.attributeName === ""
          ? this.root.wordCollection.getRandomWord()
          : this.attributeName;
      this.root.attributeCollection.putEditable(this.organism, attributeName);
      this.root.save();
    },
    clearStorage: function () {
      this.root.clearStorage();
    },
    removeOrganism: function (organism) {
      this.root.organismCollection.remove(organism);
      this.root.save();
    },
    init: function () {
      const element = this.$refs["organism"];
      new ResizeSensor(element, () => {
        this.root.organismLayout.recalculate();
      });

      this.root.organismLayout.registerOrganismElement(
        element,
        this.organism.id
      );
      this.root.organismLayout
        .getLocalPositionObservable(this.organism.id)
        .subscribe((localPosition) => {
          this.position.top = localPosition.top;
          this.position.left = localPosition.left;
        });
    },
  },
  mounted() {
    if (this.organism == null) {
      window.setTimeout(() => this.init(), 200);
      return;
    } else {
      this.init();
    }
  },
  destroyed() {
    this.root.organismLayout.recalculate();
  },
};
</script>

<style scoped>
.organism {
  position: absolute;
  /* margin-bottom: 20px; */
  border: 1px solid black;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 20px;
  border-radius: 2px;
  /* margin-top: 10px; */
  background-color: white;
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
  border-bottom: 2px solid rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
  margin-top: 10px;
}
.organism-name {
  color: #4dc47d;
  font-weight: 500;
  font-size: 24px;
}
.title-bar {
  display: flex;
  justify-content: space-between;
}
.button {
  background-image: url("/icons/remove.svg");
  background-size: 16px 16px;
  background-repeat: no-repeat;
  background-position: center;
  width: 20px;
  height: 20px;
  border: none;
}
</style>
