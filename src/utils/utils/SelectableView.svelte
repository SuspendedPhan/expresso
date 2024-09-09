<script lang="ts">
  import { of } from "rxjs";
  import { type ExItem } from "src/ex-object/ExItem";

  export let item: ExItem;

  let clazz: string = "";
  export { clazz as class };

  const selected$ = of(false);

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
