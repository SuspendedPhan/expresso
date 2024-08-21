<script lang="ts">
  import { onMount, tick } from "svelte";
  import { ElementLayout } from "../layout/ElementLayout";
  import { ResizeSensor } from "css-element-queries";
  import { log5 } from "src/utils/utils/Log3";

  const log55 = log5("NodeView.svelte");

  export let elementLayout: ElementLayout;
  export let elementKey: string;

  let element: HTMLElement;
  onMount(() => {
    elementLayout.registerElement(element, elementKey);
    const sub = elementLayout
      .getLocalPositionObservable(elementKey)
      .subscribe((position) => {
        log55.debug2("elementKey", elementKey);
        log55.debug("position", position);

        element.style.left = `${position.left}px`;
        element.style.top = `${position.top}px`;
      });
    elementLayout.recalculate();

    const handleResize = () => {
      tick().then(() => {
        log55.debug2("handleResize");
        log55.debug2("key", elementKey);
        log55.debug2("width", element.clientWidth);
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

<div class="absolute inline-block box-content" bind:this={element}>
  <slot></slot>
</div>
