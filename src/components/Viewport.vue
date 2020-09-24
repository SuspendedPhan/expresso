<template>
  <div class='viewport' ref='viewport'>
    <canvas :width='width' :height='height' ref='canvas'>
    </canvas>
  </div>
</template>

<script>
import Two from 'two.js';
import Root, { RenderShape } from '../store/Root';

window.root = Root;

export default {
  name: 'Viewport',
  props: {
  },
  data: () => {
    return {
      width: 0,
      height: 0,
    };
  },
  mounted: function() {
    this.update();
  },
  methods: {
    update: function() {
      const viewport = this.$refs.viewport;
      const canvas = this.$refs.canvas;
      this.width = viewport.clientWidth;
      this.height = viewport.clientHeight;
      const context = canvas.getContext('2d');
      Root.setWindowSize(this.width, this.height);
      context.fillStyle = 'black';
      context.fillRect(0, 0, this.width, this.height);

      const renderCommands = Root.computeRenderCommands();
      for (const renderCommand of renderCommands) {
        if (renderCommand.shape === RenderShape.Circle) {
          context.beginPath();
          context.arc(renderCommand.x, renderCommand.y, renderCommand.radius, 0, 2 * Math.PI);
          context.fillStyle = 'hsla(0, 50%, 50%, .5)';
          context.fill();
        } else if (renderCommand.shape === RenderShape.Rectangle) {
          context.fillStyle = 'hsla(0, 0%, 100%, 1)';
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
</style>
