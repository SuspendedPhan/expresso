<template>
  <div v-if="organism" class="organism" ref="organism" :style="style">
    <div class="title-bar">
      <div class="organism-name">
        {{ name }}
        <!--        ({{ getMetaname(organism) }})-->
      </div>
      <button v-if="!isRoot" class="button" @click="removeOrganism(organism)"></button>
    </div>
    <!--    <div class="controls">-->
    <!--      <select v-model="selectedPrimitiveId">-->
    <!--        <option-->
    <!--            v-for="metaorganism in metaorganismCollection.getMetaorganisms()"-->
    <!--            :key="metaorganism.id"-->
    <!--            :value="metaorganism.id"-->
    <!--        >-->
    <!--          {{ metaorganism.name }}-->
    <!--        </option>-->
    <!--      </select>-->
    <!--      <button @click="spawn">Spawn Suborganism</button>-->
    <!--      <input placeholder="Attribute name" v-model="attributeName" />-->
    <!--      <button @click="addAttribute">Add Attribute</button>-->
    <!--    </div>-->
    <div class="attribute-group">
      <div
        class="attribute"
        v-for="(attribute, index) in editableAttributes"
        :key="attribute.getId()"
      >
        <div v-if="index !== 0" class="divider"></div>
        <WasmAttribute :attribute="attribute" />
      </div>
    </div>
    <WasmOrganism
      class="organ"
      v-for="suborganism in suborganisms"
      :key="suborganism"
      :organism="suborganism"
      :isRoot="false"
      :organismLayout="organismLayout"
    >
    </WasmOrganism>
  </div>
</template>

<script lang="ts">
import wu from 'wu'
import Root from '../store/Root'
import WasmAttribute from './WasmAttribute.vue'
import ResizeSensor from 'css-element-queries/src/ResizeSensor'
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { Primitive } from '@/models/Type'
import Functions from '@/code/Functions'

@Component({ components: { WasmAttribute: WasmAttribute } })
export default class WasmOrganism extends Vue {
  @Prop() organism!: any
  @Prop() isRoot!: boolean
  @Prop() organismLayout

  attributeStore = Root.attributeStore
  metaorganismCollection = Root.metaorganismCollection
  selectedPrimitiveId = Root.metaorganismCollection.getMetaorganisms()[0].id
  attributeName = ''
  editableAttributes = [] as any[]
  position = {
    top: 0,
    left: 0
  }

  name = ''
  suborganisms = []

  mounted() {
    if (this.organism == null) {
      window.setTimeout(() => this.init(), 200)
      return
    } else {
      this.init()
    }
  }

  destroyed() {
    this.organismLayout.recalculate()
  }

  get style() {
    return `left: ${this.position.left}px; top: ${this.position.top}px;`
  }

  spawn() {
    const metaorganism = this.metaorganismCollection.getFromId(this.selectedPrimitiveId)
    // const organ = this.root.organismCollection.putFromMeta(
    //     this.root.wordCollection.getRandomWord(),
    //     metaorganism
    // );
    // this.root.organismCollection.addChild(this.organism, organ);
    // this.root.save();
  }

  addAttribute() {
    // const attributeName =
    //     this.attributeName === ""
    //         ? this.root.wordCollection.getRandomWord()
    //         : this.attributeName;
    // this.root.attributeCollection.putEditable(this.organism, attributeName, Primitive.Undetermined);
    // this.root.save();
  }

  clearStorage() {
    // this.root.clearStorage();
  }

  removeOrganism(organism) {
    // this.root.organismCollection.remove(organism);
    // this.root.save();
  }

  init() {
    const element = this.$refs['organism'] as any
    new ResizeSensor(element, () => {
      this.organismLayout.recalculate()
    })

    this.organismLayout.registerElement(element, this.organism.getId())
    this.organismLayout
      .getLocalPositionObservable(this.organism.getId())
      .subscribe((localPosition) => {
        this.position.top = localPosition.top
        this.position.left = localPosition.left
      })

    // Attribute.onAttributeCountChanged.sub(() => {
    //   Vue.set(this, "editableAttributes", this.getEditableAttributes());
    // });
    // this.editableAttributes = this.getEditableAttributes();

    this.name = this.organism.getName()
    const attributes = Functions.vectorToArray(this.organism.getAttributes()).filter(
      (attribute) => attribute.constructor.name === 'EditableAttribute'
    )
    this.editableAttributes = attributes
  }

  getMetaname(organism) {
    return 'not implemented'
    // return this.root.metaorganismCollection.getFromId(organism.metaorganismId).name;
  }
}
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
  background-image: url('/icons/remove.svg');
  background-size: 16px 16px;
  background-repeat: no-repeat;
  background-position: center;
  width: 20px;
  height: 20px;
  border: none;
}
</style>
