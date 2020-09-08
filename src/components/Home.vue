<template>
  <div>
    <Viewport />
    <Expressor />
  </div>
</template>

<script>
import Viewport from './Viewport';
import Expressor from './Expressor';

export default {
  name: 'Home',
  components: {
    Viewport,
    Expressor
  },
  props: {
  },
  data: () => {

  }
}
</script>