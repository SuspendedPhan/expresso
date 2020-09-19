<template>
  <div id='viewport' class='viewport'>
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
    return {};
  },
  mounted: () => {
    var elem = document.getElementById('viewport');
    var params = { 
      type: Two.Types.webgl,
      width: elem.clientWidth,
      height: elem.clientHeight,
    };

    var two = new Two(params).appendTo(elem);
  
    two.bind('update', function() {
      two.clear();

      two.height = elem.clientHeight - 5;
      
      Root.setWindowSize(two.width, two.height);

      const renderCommands = Root.computeRenderCommands();
      for (const renderCommand of renderCommands) {
        const radius = renderCommand.radius;
        const x = renderCommand.x;
        const y = renderCommand.y;
        if (radius <= 1 || !Number.isFinite(radius)) continue;
        if (!Number.isFinite(x)) continue;
        if (!Number.isFinite(y)) continue;

        const circle = two.makeCircle(x, y, radius);
        circle.fill = 'hsla(0, 50%, 50%, .5)';
        circle.stroke = 'none';
      }
    }).play();
  }
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
