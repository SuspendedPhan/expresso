<template>
  <div id='viewport' class='viewport'>
  </div>
</template>

<script>
import Two from 'two.js';
import Store from '../code/Store';
import Node from '../code/Node';
import Gets from '../code/Gets';
import Actions from '../code/Actions';

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
    console.log(elem.clientHeight);
    var two = new Two(params).appendTo(elem);

    var circle = two.makeCircle(0, 0, 50);
    

    const storeCircle = Gets.entity(Store, 'circle');

    two.bind('update', function() {
      two.clear();

      const renderCommands = Actions.computeRenderCommands(Store, storeCircle);
      for (const renderCommand of renderCommands) {
        const radius = renderCommand.radius;
        const x = renderCommand.x;
        const y = renderCommand.y;
        if (radius <= 0) continue;

        const circle = two.makeCircle(x, y, radius);
        circle.fill = '#FF8000';
        circle.stroke = 'orangered';
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
  height: 50vh;
}
</style>
