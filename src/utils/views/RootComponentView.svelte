<script lang="ts">
  import type { Component } from "src/ex-object/ExObject";
  import MainContext from "src/main-context/MainContext";
  import ComponentLayout from "../layout/ComponentLayout";
  import TreeView from "../layout/TreeView.svelte";
  import ComponentView from "./ComponentView.svelte";
  import { ResizeSensor } from "css-element-queries";
  import { onMount, tick } from "svelte";

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
</script>

<div class={clazz}>
  <TreeView {elementLayout}>
    <div bind:this={element}>
      <ComponentView {ctx} {component} {elementLayout} />
    </div>
  </TreeView>
</div>

<style></style>
