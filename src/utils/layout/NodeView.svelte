<script lang="ts">
  import { onMount } from "svelte";
  import { ElementLayout } from "../layout/ElementLayout";

  export let elementLayout: ElementLayout;
  export let elementKey: string;

  let element: HTMLElement;
  onMount(() => {
    elementLayout.registerElement(element, elementKey);
    const sub = elementLayout
      .getLocalPositionObservable(elementKey)
      .subscribe((position) => {
        element.style.left = `${position.left}px`;
        element.style.top = `${position.top}px`;
      });
    elementLayout.recalculate();

    return () => {
      sub.unsubscribe();
    };
  });
</script>

<div class="absolute inline-block" bind:this={element}>
  <slot></slot>
</div>
