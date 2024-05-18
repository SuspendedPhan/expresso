<template>
  <div class="absolute border-solid border-2 border-gray-600 bg-white mx-auto max-w-fit" ref="rootElement" :style="{ left: position.left + 'px', top: position.top + 'px' }">
    <div class="mt-8 underline">{{name}}</div>
    <button class="mt-2 text-sm p-0.5">Remove</button>
    <div class="mt-8 border-t-2 border-gray-600"></div>
    <div class="divide-y-2 divide-gray-400">
      <div v-for="attribute in attributes" :key="attribute.id">
        <GoAttribute class="p-4 mx-auto" :setup-func="attribute.setupFunc"/>
      </div>
    </div>
    <div class="border-t-2 border-gray-400"></div>
    <button class="button p-0.5 m-4" @click="addAttribute">Add Attribute</button>
    <div class="border-t-2 border-gray-400"></div>
    <button class="button p-0.5 m-4" @click="addChildOrganism">Add Child Organism</button>
    <GoOrganism v-for="child in children" :key="child.id" :setupFunc="child.setupFunc"></GoOrganism>
  </div>
</template>

<script>
import GoAttribute from "@/components/GoAttribute.vue";

export default {
  name: "GoOrganism",
  components: {GoAttribute},
  props: {setupFunc: {}},
  setup(props) {
    // setupFunc() returns an object where all the keys can be used as variables in the template
    return props.setupFunc();
  }
}
</script>

<style scoped>
.max-w-fit {
  max-width: fit-content;
}
</style>