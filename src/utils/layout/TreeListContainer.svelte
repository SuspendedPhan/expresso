<!-- 
TreeListContainer can contain multiple TreeViews, all centered at x=0.
The container will be translated so that x=0 aligns with the left edge of the largest TreeView.
-->
<script lang="ts">
  import { ResizeSensor } from "css-element-queries";
  import { combineLatest, map, ReplaySubject, switchMap } from "rxjs";
  import type { ElementLayout } from "src/utils/layout/ElementLayout";
  import type { OBS } from "src/utils/utils/Utils";
  import { onMount } from "svelte";

  let clazz = "";

  export let layouts$: OBS<readonly ElementLayout[]>;
  export { clazz as class };
  export let containerPadding: string; // For example, "1rem"

  let rootElement: HTMLElement;
  const containerWidth$ = new ReplaySubject<number>(1);
  onMount(() => {
    const sensor = new ResizeSensor(rootElement, ({ width }) => {
      containerWidth$.next(width);
    });
    return () => {
      sensor.detach();
    };
  });

  const xTranslation$ = layouts$.pipe(
    map((layouts) => {
      return combineLatest(layouts.map((layout) => layout.onCalculated));
    }),
    switchMap((outputs) => {
      return combineLatest([containerWidth$, outputs]);
    }),
    map(([width, outputs]) => {
      // Get the largest width
      let largestWidth = 0;
      for (const output of outputs) {
        if (output.totalWidth > largestWidth) {
          largestWidth = output.totalWidth;
        }
      }

      if (largestWidth < width) {
        return `0px`;
      } else {
        const translation = largestWidth / 2 - width / 2;
        return `calc(${translation}px + ${containerPadding} / 2)`;
      }
    })
  );
</script>

<div
  bind:this={rootElement}
  class={clazz}
  style:transform="translateX({$xTranslation$})"
>
  <slot />
</div>
