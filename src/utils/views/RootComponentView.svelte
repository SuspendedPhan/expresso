<script lang="ts">
  import type { Component } from "src/ex-object/ExObject";
  import MainContext from "src/main-context/MainContext";
  import ComponentLayout from "../layout/ComponentLayout";
  import TreeView from "../layout/TreeView.svelte";
  import ComponentView from "./ComponentView.svelte";
  import { ResizeSensor } from "css-element-queries";
  import { onMount, tick } from "svelte";
  import { combineLatest, first, map } from "rxjs";

  export let ctx: MainContext;
  export let component: Component;
  let clazz = "";
  export { clazz as class };

  const elementLayout = ComponentLayout.create(ctx, component);

  let element: HTMLElement;

  onMount(() => {
    new ResizeSensor(element, () => {
      tick().then(() => {
        elementLayout.recalculate();
      });
    });
  });

  const xTranslation$ = combineLatest([
    elementLayout.onCalculated,
    ctx.viewCtx.editorViewWidth$,
  ]).pipe(
    map(([output, width]) => {
      if (output.totalWidth < width) {
        return 0;
      } else {
        return output.totalWidth / 2 - width / 2;
      }
    })
  );
</script>

<div class={clazz}>
  <div style:transform="translateX({$xTranslation$}px)">
    <TreeView {elementLayout} {ctx}>
      <div bind:this={element}>
        <ComponentView {ctx} {component} {elementLayout} />
      </div>
    </TreeView>
  </div>
</div>

<style></style>
