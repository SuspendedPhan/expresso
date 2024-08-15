<script lang="ts">
  import { type ExItem } from "src/ex-object/ExItem";
  import type MainContext from "src/main-context/MainContext";

  export let item: ExItem;
  export let ctx: MainContext;
  let clazz: string = "";
  export { clazz as class };

  const selected$ = ctx.focusManager.isSelected$(item);

  function handleClick(event: MouseEvent) {
    event.stopPropagation();
    console.error("fix this");
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  on:mousedown={handleClick}
  class=" ring-black {clazz}"
  class:ring-2={$selected$}
>
  <slot />
</div>
