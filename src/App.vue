<template>
  <div id="app">
    <Viewport msg="Welcome to Your Vue.js App"/>
    <Expressor />
  </div>
</template>

<script>
import Viewport from './components/Viewport.vue'
import Expressor from './components/Expressor.vue'

export default {
  name: 'App',
  components: {
    Viewport,
    Expressor,
  }
}
</script>

<style>
body {
  font-size: 16pt;
}
input {
  font-size: 16pt;
}
</style>
