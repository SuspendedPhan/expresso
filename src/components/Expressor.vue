<template>
  <div>
    <span>radius: </span>
    <Node :node="radiusNode" />
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
      radiusNode: Store.radius,
    };
  },
}
</script>

<style scoped>
</style>
