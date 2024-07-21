<script lang="ts">
  import type MainContext from "src/main-context/MainContext";
  import type { Selectable } from "src/utils/utils/Selection";

  export let object: Selectable;
  export let ctx: MainContext;
  export let classString: string = "";

  const selected$ = ctx.selection.isSelected$(object);

  function handleClick(event: MouseEvent) {
    event.stopPropagation();
    ctx.selection.select(object);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  on:mousedown={handleClick}
  class="border {classString}"
  class:border-black={$selected$}
>
  <slot />
</div>
