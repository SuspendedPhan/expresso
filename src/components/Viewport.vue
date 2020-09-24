<template>
  <div class='viewport' ref='viewport'>
    <canvas :width='width' :height='height' ref='canvas'>
    </canvas>
  </div>
</template>

<script>
import Two from 'two.js';
import Root from '../store/Root';

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
      context.clearRect(0, 0, this.width, this.height);

      const renderCommands = Root.computeRenderCommands();
      for (const renderCommand of renderCommands) {
        context.beginPath();
        context.arc(renderCommand.x, renderCommand.y, renderCommand.radius, 0, 2 * Math.PI);
        context.fillStyle = 'hsla(0, 50%, 50%, .5)';
        context.fill();
      }
      window.requestAnimationFrame(this.update);
    },
  },
}
</script>

<style scoped>
.viewport {
  border-color: black;
  border-style: solid;
  border-width: 1px;
  /* height: 100%;
  width: 100%; */
}
</style>
