<script lang="ts">
  import type MainContext from "src/main-context/MainContext";
  import type { Selectable } from "src/utils/utils/Selection";

  export let object: Selectable;
  export let ctx: MainContext;
  let clazz: string = "";
  export { clazz as class };

  const selected$ = ctx.selection.isSelected$(object);

  function handleClick(event: MouseEvent) {
    event.stopPropagation();
    ctx.selection.select(object);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:mousedown={handleClick} class={clazz} class:ring={$selected$}>
  <slot />
</div>
