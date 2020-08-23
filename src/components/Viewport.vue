<template>
  <div id="viewport">
  </div>
</template>

<script>
import Two from "two.js";
import Store from "../code/Store";
import Node from '../code/Node';
import Gets from '../code/Gets';

export default {
  name: 'Viewport',
  props: {
  },
  data: () => {
    return {};
  },
  mounted: () => {
    var elem = document.getElementById('viewport');
    var params = { type: Two.Types.webgl };
    var two = new Two(params).appendTo(elem);

    var circle = two.makeCircle(0, 0, 50);
    circle.fill = '#FF8000';
    circle.stroke = 'orangered';

    const storeCircle = Gets.entity(Store, 'circle');

    two.bind('update', function() {
      circle.radius = Node.eval(Gets.property(storeCircle, 'radius'));
      circle.radius = Math.max(1, circle.radius);
      
      const x = Node.eval(Gets.property(storeCircle, 'x'));
      const y = Node.eval(Gets.property(storeCircle, 'y'));
      circle.translation.set(x, y);
    }).play();
  }
}
</script>

<style scoped>
</style>
