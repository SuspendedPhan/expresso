<template>
  <div class="children">
    <div v-for="(value, key) in subroot" :key="key" class="child">
      <div :id="cardIdFromName(key)" class="card">{{ key }}</div>
      <WatLine :cardId="cardIdFromName(key)" :node="nodeFromName(key)"></WatLine>
      <WatNode ref="node" :idid="nodeIdFromName(key)" :id="nodeIdFromName(key)" :subroot="value" />
    </div>
  </div>
</template>

<script>
import Viewport from './Viewport'
import Expressor from './Expressor'
import TestRunner from './tests/TestRunner.vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import WatLine from './WatLine.vue'
import Vue from 'vue'

let root = {
  'the void': {
    earth: null,
    moon: null
  }
}

root = {
  'the void': {
    earth: {
      california: {
        SF: {
          'fishermans wharf': null
        },
        SD: null,
        LA: null,
        OC: null
      },
      georgia: {
        atlanta: null
      },
      texas: {
        houstan: null,
        dallas: null
      }
    },
    moon: {
      'a rock': null
    }
  }
}

@Component({ components: { WatLine } })
export default class WatNode extends Vue {
  @Prop() id
  @Prop({ default: () => root }) subroot
  updateit = 0

  mounted() {
    this.updateit++
  }

  cardIds() {
    this.updateit
    const ret = []
    if (this.subroot === null) return ret
    for (const [key, value] of Object.entries(this.subroot)) {
      ret.push(this.cardIdFromName(key))
    }
    return ret
  }

  cardIdFromName(name) {
    this.updateit
    return 'card ' + name
  }

  nodeFromName(name) {
    this.updateit
    if (!this.$refs['node']) return
    const node = this.$refs['node'].find((t) => {
      return t.id === this.nodeIdFromName(name)
    })
    console.assert(node)
    return node
  }

  nodeIdFromName(name) {
    this.updateit
    return 'node ' + name
  }
}
</script>
<style scoped>
.card {
  margin: 10px;
  background: #fffcf9;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.2);
  padding: 10px;
  /* max-width: 100%; */
  /* overflow: hidden; */
}
.children {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  /* display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  grid-template-rows: 100%;
  overflow: hidden; */
}
.child {
  /* position: relative;
  grid-template-rows: min-content min-content;
  display: grid; */
  display: flex;
  /* justify-content: center; */
  align-items: center;
  flex-direction: column;
}
.line {
  border: 1px solid rgba(180, 170, 135, 0.6);
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.2);
}
</style>
