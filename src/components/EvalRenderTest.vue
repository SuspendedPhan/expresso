<template>
  <div>
    <Viewport />
  </div>
</template>

<script>
import Viewport from './Viewport'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import Vue from 'vue'
import Root from '@/store/Root'

@Component({
  components: {
    Viewport
  }
})
export default class EvalRenderTest extends Vue {
  mounted() {
    Root.load()
    Root.organismCollection.initRootOrganism()
  }
}
</script>
<style scoped></style>
