<script lang="ts">
  export let focused: boolean;
  let clazz: string = "";
  export { clazz as class };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  on:mousedown|stopPropagation
  class="{clazz} ring-black"
  class:ring-2={focused}
>
  <slot />
</div>
