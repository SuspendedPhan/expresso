<template>
  <div id='viewport' class='viewport'>
  </div>
</template>

<script>
import Two from 'two.js';
import Store from '../store/Root';
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
    var two = new Two(params).appendTo(elem);

    var circle = two.makeCircle(0, 0, 50);
    

    const storeCircle = Gets.entity(Store, 'circle');
    const storeWidth = Actions.addComputedProperty(Store, storeCircle, 'width');
    const storeHeight = Actions.addComputedProperty(Store, storeCircle, 'height');
    Actions.assignNumberToVariable(Store, storeWidth, two.width);
    Actions.assignNumberToVariable(Store, storeHeight, two.height);

    two.bind('update', function() {
      two.clear();

      const renderCommands = Actions.computeRenderCommands(Store, Gets.entity(store, 'circle'));
      for (const renderCommand of renderCommands) {
        const radius = renderCommand.radius;
        const x = renderCommand.x;
        const y = renderCommand.y;
        if (radius <= 0 || !Number.isFinite(radius)) continue;
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
  height: 50vh;
}
</style>
