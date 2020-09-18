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
  
    {
      const storeCircle = Root.organismCollection.putFromMeta('circle', Root.metaorganismCollection.getFromName('Circle'));
      const storeWidth = Root.attributeStore.putEmergent(storeCircle, 'width');
      const storeHeight = Root.attributeStore.putEmergent(storeCircle, 'height');
      Root.attributeStore.assignNumber(storeWidth, two.width);
      Root.attributeStore.assignNumber(storeHeight, two.height);
      Root.attributeStore.assignNumber(Root.attributeStore.getAttributeFromName(storeCircle, 'clones'), 5);
      Root.attributeStore.assignNumber(Root.attributeStore.getAttributeFromName(storeCircle, 'radius'), 50);
    }

    {
      const storeCircle = Root.organismCollection.putFromMeta('holy circle', Root.metaorganismCollection.getFromName('Circle'));
      const storeWidth = Root.attributeStore.putEmergent(storeCircle, 'width');
      const storeHeight = Root.attributeStore.putEmergent(storeCircle, 'height');
      Root.attributeStore.assignNumber(storeWidth, two.width);
      Root.attributeStore.assignNumber(storeHeight, two.height);
      Root.attributeStore.assignNumber(Root.attributeStore.getAttributeFromName(storeCircle, 'clones'), 5);
      Root.attributeStore.assignNumber(Root.attributeStore.getAttributeFromName(storeCircle, 'radius'), 50);
    }

    two.bind('update', function() {
      two.clear();

      const renderCommands = Root.computeRenderCommands();
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
  /* height: 100%;
  width: 100%; */
}
</style>
