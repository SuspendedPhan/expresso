<script setup lang="ts">
import { Component } from '@/domain/Domain'
import { ref } from 'vue'
import ExpAttribute from './ExpAttribute.vue'
const { component } = defineProps(['component'])

const attributes = ref([])
component.getAttributes().subscribe((attrs) => {
  attributes.value = [...attrs]
  console.log(attrs)
})
</script>

<template>
  <div>
    <div>{{ component.id }}</div>
    <ExpAttribute v-for="attr in attributes" :key="attr.id" :attribute="attr"></ExpAttribute>
    <button @click="component.addAttribute()">Add Attribute</button>
  </div>
</template>
