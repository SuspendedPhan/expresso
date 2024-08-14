<script lang="ts">
  let clazz = "";
  export { clazz as class };

  export let centered = true;
</script>

<div
  class:justify-items-center={centered}
  class:justify-center={centered}
  class="grid justify-items-center justify-center min-w-full w-max {clazz}"
  style="grid-template-columns: minmax(auto, 1fr)"
>
  <slot></slot>
</div>
