<template>
  <div>
    <div>{{ label }}</div>
    <input type="checkbox" :checked="checked" @change="onChange" />
  </div>
</template>
<script lang="ts">
import {ref} from "@vue/composition-api";

export default {
  name: 'GlobalToggle',
  props: {
    label: {}
  },
  setup(props) {
    const checked = ref(false);
    function onChange(event) {
      checked.value = event.target.checked;
      (window as any)[props.label] = checked.value;
    }

    return {
      checked, onChange
    }
  }
}
</script>
