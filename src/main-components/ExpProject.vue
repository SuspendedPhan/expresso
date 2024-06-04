<script setup>
import { ComponentStore } from '@/store/ComponentStore'
import Comp from '@/main-components/ExpComponent.vue'
import { Component } from '@/domain/Component'
import { ref } from 'vue'

const store = new ComponentStore()
const components = ref([])
components.value = [new Component()]
store.getComponents().subscribe((data) => {
  components.value = [...data]
})
</script>

<template>
  <button @click="store.addComponent">Add Component</button>
  <div v-for="component in components" :key="component.id">
    <Comp :component="component" />
  </div>
</template>
