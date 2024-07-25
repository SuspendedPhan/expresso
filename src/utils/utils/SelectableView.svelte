<script lang="ts">
  import { type ExObject } from "src/ex-object/ExObject";
  import type MainContext from "src/main-context/MainContext";

  export let object: ExObject;
  export let ctx: MainContext;
  let clazz: string = "";
  export { clazz as class };

  const selected$ = ctx.focusManager.isSelected$(object);

  function handleClick(event: MouseEvent) {
    event.stopPropagation();
    ctx.focusManager.focusExObject(object);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:mousedown={handleClick} class={clazz} class:ring={$selected$}>
  <slot />
</div>
