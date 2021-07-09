<template>
  <div>{{ parameter.getName() }}</div>
</template>
<script lang="ts">
export default {
  name: 'ProjectFunctionParameter',
  props: {parameter: {}}
}
</script>