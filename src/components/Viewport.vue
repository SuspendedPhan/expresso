<template>
  <div id="viewport">
  </div>
</template>

<script>
import Two from "two.js";
import Store from "../code/Store";
import { MetaNode } from '../code/MetaNodes';

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

    two.bind('update', function() {
      circle.radius = MetaNode.eval(Store.circle.radius);
      circle.radius = Math.max(1, circle.radius);
    }).play();
  }
}
</script>

<style scoped>
</style>
