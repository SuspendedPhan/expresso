<template>
  <div>
    <span>radius: </span>
    <Node :astNode="store.circle.radius" />
  </div>
</template>

<script>
import Node from "./Node";
import Store from '../code/Store';

export default {
  name: 'Expressor',
  components: {
    Node,
  },
  props: {
  },
  data: () => {
    return {
      store: Store,
    };
  },
  created() {
    // this.store = Store;
  }
}
</script>

<style scoped>
</style>
