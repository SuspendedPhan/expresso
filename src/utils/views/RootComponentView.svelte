<script lang="ts">
  import { ResizeSensor } from "css-element-queries";
  import { first } from "rxjs";
  import type { Component } from "src/ex-object/ExObject";
  import MainContext from "src/main-context/MainContext";
  import { onMount, tick } from "svelte";
  import ComponentLayout from "../layout/ComponentLayout";
  import TreeView from "../layout/TreeView.svelte";
  import ComponentView from "./ComponentView.svelte";

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

    ctx.viewCtx.componentLayouts$.pipe(first()).subscribe((layouts) => {
      ctx.viewCtx.componentLayouts$.next([...layouts, elementLayout]);
    });

    return () => {
      ctx.viewCtx.componentLayouts$.pipe(first()).subscribe((layouts) => {
        ctx.viewCtx.componentLayouts$.next(
          layouts.filter((layout) => layout !== elementLayout)
        );
      });
    };
  });
</script>

<div class={clazz}>
  <TreeView {elementLayout} {ctx}>
    <div bind:this={element}>
      <ComponentView {ctx} {component} {elementLayout} />
    </div>
  </TreeView>
</div>

<style></style>
