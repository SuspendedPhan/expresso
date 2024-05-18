<template>
  <div class="expressor" ref="expressor">
    <canvas
      ref="canvas"
      type="2d"
      :width="canvasWidth"
      :height="canvasHeight"
      class="canvas"
    ></canvas>
    <div ref="panzoom">
      <Organism :organism="root.organismCollection.getRoot()" :isRoot="true" />
      <div class="absolute border-solid border-2" :style="boxStyle"></div>
      <div class="bottom-group">
        <button @click="clearStorage" class="clearStorage">Clear storage</button>
        <div :class="['error-box', { error: consoleError }]">you have console errors</div>
      </div>
    </div>
  </div>
</template>

<script>
import { PenPositionRelation } from '@/store/Pen'
import wu from 'wu'
import Root from '../store/Root'
import Node from './Node'
import Organism from './Organism'
import Vue from 'vue'
import panzoom from 'panzoom'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import ResizeSensor from 'css-element-queries/src/ResizeSensor'

@Component({
  components: {
    // Node,
    Organism
  }
})
export default class Expressor extends Vue {
  root = Root
  attributeStore = Root.attributeStore
  metaorganismCollection = Root.metaorganismCollection
  selectedPrimitiveId = Root.metaorganismCollection.getMetaorganisms()[0].id
  consoleError = false
  canvasWidth = 0
  canvasHeight = 0
  panzoomTransform = {}
  lines = []

  box = {
    width: 0,
    height: 0
  }

  get boxStyle() {
    console.log('get style')
    console.log(this.box.width)
    return `left: 0px; width: ${this.box.width}px; height: ${this.box.height}px`
  }

  getNodeForAttribute(attribute) {
    return Root.nodeStore.getChild(Root.attributeStore.getRootNode(attribute), 0)
  }

  spawn() {
    const metaorganism = this.metaorganismCollection.getFromId(this.selectedPrimitiveId)
    this.root.organismCollection.putFromMeta(undefined, metaorganism)
    this.root.save()
  }

  clearStorage() {
    this.root.clearStorage()
  }

  removeOrganism(organism) {
    this.root.organismCollection.remove(organism)
    this.root.save()
  }

  drawLines() {
    const context = this.$refs['canvas'].getContext('2d')
    context.resetTransform()
    context.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
    const transform = this.panzoomTransform
    context.setTransform(transform.scale, 0, 0, transform.scale, transform.x, transform.y)
    context.strokeStyle = 'gray'
    for (const line of this.lines) {
      context.beginPath()
      context.moveTo(line.startX, line.startY)
      context.lineTo(line.endX, line.endY)
      context.stroke()
    }
  }

  mounted() {
    const pz = panzoom(this.$refs['panzoom'], {
      beforeMouseDown: function (e) {
        var shouldIgnore = !e.altKey
        return shouldIgnore
      },
      filterKey: function (/* e, dx, dy, dz */) {
        // don't let panzoom handle this event:
        return true
      },
      zoomDoubleClickSpeed: 1
    })
    pz.on('transform', (e) => {
      this.panzoomTransform = pz.getTransform()
      this.drawLines()
    })

    // NOTE: maybe can remove?
    this.canvasWidth = this.$refs['expressor'].clientWidth
    this.canvasHeight = this.$refs['expressor'].clientHeight

    new ResizeSensor(this.$refs['expressor'], () => {
      this.canvasWidth = this.$refs['expressor'].clientWidth
      this.canvasHeight = this.$refs['expressor'].clientHeight
    })

    this.root.organismLayout.onCalculated.subscribe((output) => {
      this.lines = output.lines
      this.box.width = output.totalWidth
      this.box.height = output.totalHeight
      this.drawLines()
    })
  }
}
</script>

<style scoped>
.expressor {
  position: relative;
  outline: none;
}
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
.bottom-group {
  display: flex;
  justify-content: space-between;
}
.error-box {
  padding: 5px;
  font-size: 12px;
  background-color: hsl(0, 100%, 67%);
  visibility: hidden;
  color: white;
}
.error-box.error {
  visibility: visible;
}
.canvas {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0px;
  left: 0px;
  border: none;
}
.clearStorage {
  position: fixed;
  top: 10px;
  left: 200px;
  z-index: 2;
}
</style>
