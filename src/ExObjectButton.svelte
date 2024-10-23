<script lang="ts">
  let clazz = "";
  export { clazz as class };
</script>

<button on:click|stopPropagation class="btn btn-sm text-xs w-max self-center {clazz}">
  <slot></slot>
</button>
