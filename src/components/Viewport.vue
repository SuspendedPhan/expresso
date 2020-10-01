<template>
  <div class='viewport' ref='viewport'>
    <canvas :width='width' :height='height' ref='canvas'>
    </canvas>
    <div class='fps'>{{ framerate }}</div>
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
    };
  },
  created: function() {
    this.ticker = fps({ every: 10 });
    this.ticker.on('data', framerate => this.framerate = numeral(framerate).format('0'));
  },
  mounted: function() {
    this.update();
  },
  methods: {
    update: function() {
      this.ticker.tick();

      const viewport = this.$refs.viewport;
      const canvas = this.$refs.canvas;
      this.width = viewport.clientWidth;
      this.height = viewport.clientHeight;
      const context = canvas.getContext('2d');
      Root.setWindowSize(this.width, this.height);
      context.clearRect(0, 0, this.width, this.height);
      context.fillStyle = 'black';
      context.fillRect(0, 0, this.width, this.height);

      const renderCommands = Root.computeRenderCommands();
      for (const renderCommand of renderCommands) {
        const alpha = renderCommand.alpha ?? .5;
        if (renderCommand.shape === RenderShape.Circle) {
          context.beginPath();
          context.arc(renderCommand.x, renderCommand.y, renderCommand.radius, 0, 2 * Math.PI);
          context.fillStyle = `hsla(0, 0%, 100%, ${alpha})`;
          context.fill();
        } else if (renderCommand.shape === RenderShape.Rectangle) {
          context.fillStyle = `hsla(0, 0%, 100%, ${alpha})`;
          const centerx = renderCommand.x - renderCommand.width / 2;
          const centery = renderCommand.y - renderCommand.height / 2;
          context.fillRect(centerx, centery, renderCommand.width, renderCommand.height);
          context.fill();
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
</style>
