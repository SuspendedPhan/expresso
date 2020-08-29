<template>
  <div>
    <div v-for='property in properties' :key='property.id'>
      <span>{{ propertyName(property) }}: </span>
      <Node :astNode="nodeForProperty(property)" />
    </div>
  </div>
</template>

<script>
import Node from "./Node";
import Store from '../code/Store';
import Gets from '../code/Gets';
import wu from 'wu';

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
    properties: function() {
      const entity = Gets.entity(this.store, 'circle');
      const props = wu.values(Gets.properties(entity));
      return Array.from(props);
    },
  },
  methods: {
    propertyName: function(property) {
      return Gets.propertyName(Store, property);
    },
    nodeForProperty: function(property) {
      return property.children[0];
    }
  },
  created() {
    // this.store = Store;
  }
}
</script>

<style scoped>
</style>
