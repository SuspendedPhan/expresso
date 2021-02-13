<template>
  <div class='viewport' ref='viewport'>
    <canvas :width='width' :height='height' ref='canvas' @mousemove ="testMethod($event)">
    </canvas>
    <div class='fps'>{{ framerate }}</div>
    <div class='nodes'>nodes: {{ Root.nodeCollection.nodes.items.length }}</div>
  </div>
</template>

<script>
import Two from 'two.js';
import Root, { RenderShape } from '../store/Root';
import fps from 'fps';
import numeral from 'numeral';

window.root = Root;

export default {
  name: 'Viewport',
  props: {
  },
  data: () => {
    return {
      width: 0,
      height: 0,
      framerate: 0,
      Root: Root,
      mostRecentClickCoordinates: {x: 0, y:0}
    };
  },
  created: function() {
    this.ticker = fps({ every: 10 });
    this.ticker.on('data', framerate => this.framerate = numeral(framerate).format('0'));
  },
  mounted: function() {
    this.update();
    // this.testMethod(event);
  },
  methods: {
    testMethod(event){
     this.mostRecentClickCoordinates = {
       x: event.clientX,
       y: event.clientY
     }
    },
    update: function() {
      if (this.$refs.viewport === undefined) return;

      this.ticker.tick();
      const viewport = this.$refs.viewport;
      const canvas = this.$refs.canvas;
      this.width = viewport.clientWidth;
      this.height = viewport.clientHeight;
      const context = canvas.getContext('2d');
      Root.setWindowSize(this.width, this.height);
      Root.setMouseLocation(this.mostRecentClickCoordinates.x, this.mostRecentClickCoordinates.y);
      context.clearRect(0, 0, this.width, this.height);
      context.fillStyle = 'black';
      context.fillRect(0, 0, this.width, this.height);

      const renderCommands = Root.computeRenderCommands();
      for (const renderCommand of renderCommands) {
        const alpha = renderCommand.alpha ?? .5;
        const hue = renderCommand.hue ?? 0;
        const saturation = renderCommand.saturation ?? 0;
        const lightness = renderCommand.lightness ?? .5;
        const fillStyle = `hsla(${hue * 360}, ${saturation * 100}%, ${lightness * 100}%, ${alpha})`;
        context.fillStyle = fillStyle;
        context.strokeStyle = fillStyle;
        if (renderCommand.shape === RenderShape.Circle) {
          context.beginPath();
          context.arc(renderCommand.x, renderCommand.y, renderCommand.radius, 0, 2 * Math.PI);
          context.fill();
        } else if (renderCommand.shape === RenderShape.Rectangle) {
          const centerx = renderCommand.x - renderCommand.width / 2;
          const centery = renderCommand.y - renderCommand.height / 2;
          context.fillRect(centerx, centery, renderCommand.width, renderCommand.height);
          context.fill();
        } else if (renderCommand.shape === RenderShape.Line) {
          context.lineWidth = renderCommand.width;
          context.beginPath();
          context.moveTo(renderCommand.startX, renderCommand.startY);
          context.lineTo(renderCommand.endX, renderCommand.endY);
          context.stroke();
        }
      }
      window.requestAnimationFrame(this.update);
    },
  },
}
</script>

<style scoped>
.fps {
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 20px;
  background-color: white;
  width: 50px;
  text-align: center;
}
.nodes {
  position: absolute;
  bottom: 0;
  right: 70px;
  margin: 20px;
  background-color: white;
  padding-left: 10px;
  padding-right: 10px;
  text-align: center;
}
</style>
