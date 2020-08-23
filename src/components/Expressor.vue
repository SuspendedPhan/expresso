<template>
  <div>
    <div>
      <span>radius: </span>
      <Node :astNode="radiusNode" />
    </div>

    <div>
      <span>x: </span>
      <Node :astNode="xNode" />
    </div>

    <div>
      <span>y: </span>
      <Node :astNode="yNode" />
    </div>
  </div>
</template>

<script>
import Node from "./Node";
import Store from '../code/Store';
import Gets from '../code/Gets';

export default {
  name: 'Expressor',
  components: {
    Node,
  },
  props: {
  },
  data: function() {
    return {
      store: Store,
    };
  },
  computed: {
    // nodes: function() {
    //   const entity = Gets.entity(this.store, 'circle');
    //   return Array.from(Gets.properties(entity));
    // },
    radiusNode: function() {
      const entity = Gets.entity(this.store, 'circle');
      return Gets.property(entity, 'radius').children[0];
    },
    xNode: function() {
      const entity = Gets.entity(this.store, 'circle');
      return Gets.property(entity, 'x').children[0];
    },
    yNode: function() {
      const entity = Gets.entity(this.store, 'circle');
      return Gets.property(entity, 'y').children[0];
    },
  },
  created() {
    // this.store = Store;
  }
}
</script>

<style scoped>
</style>
