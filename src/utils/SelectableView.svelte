<script lang="ts">
  import MainContext from "src/main-context/MainContext";
  import { type Selectable } from "src/utils/Selection";

  export let object: Selectable;
  export let ctx: MainContext;

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
  class="border border-black"
  class:border-solid={$selected$}
  class:border-transparent={!$selected$}
>
  <slot />
</div>
