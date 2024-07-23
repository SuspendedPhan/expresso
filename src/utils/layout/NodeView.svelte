<script lang="ts" generics="T extends ElementNode<T>">
  import { Subject } from "rxjs";

  import ElementLayout, { type ElementNode } from "./ComponentLayout";

  import { onMount, tick } from "svelte";
  import { ResizeSensor } from "css-element-queries";

  export let elementLayout: ElementLayout<T>;
  export let layoutObject: T;

  let element: HTMLElement;
  const width$ = new Subject<number>();
  const height$ = new Subject<number>();

  onMount(() => {
    elementLayout.registerElement(layoutObject, {
      width$,
      height$,
    });

    const sub = elementLayout
      .getOutput(layoutObject)
      .worldPosition$.subscribe((pos) => {
        element.style.left = `${pos.left}px`;
        element.style.top = `${pos.top}px`;
      });

    const handleResize = () => {
      tick().then(() => {
        width$.next(element.offsetWidth);
        height$.next(element.offsetHeight);
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
