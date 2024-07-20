<script lang="ts">
  import { onMount, tick } from "svelte";
  import { ElementLayout } from "../layout/ElementLayout";
  import { ResizeSensor } from "css-element-queries";

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

    const handleResize = () => {
      tick().then(() => {
        elementLayout.recalculate();
      });
    };
    const sensor = new ResizeSensor(element, handleResize);

    return () => {
      sensor.detach(handleResize);
      sub.unsubscribe();
    };
  });
</script>

<div class="absolute inline-block" bind:this={element}>
  <slot></slot>
</div>
