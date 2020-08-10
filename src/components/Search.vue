<template>
<div>
  <input @keydown="keydown" v-model="value" />
</div>
</template>

<script>

export default {
  name: 'Search',
  props: {
  },
  data: () => {
    return {
      value: "",
    };
  },
  methods: {
    keydown(event) {
      console.log(event.key);
      if (event.key === "Enter") {
        this.$emit("selected", this.value);
      }
    },
  }
}
</script>

<style scoped>
</style>
