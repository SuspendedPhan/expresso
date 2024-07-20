<script lang="ts">
  import type { Component } from "src/ex-object/ExObject";
  import MainContext from "src/main-context/MainContext";
  import ComponentLayout from "../layout/ComponentLayout";
  import TreeView from "../layout/TreeView.svelte";
  import ComponentView from "./ComponentView.svelte";
  import { ResizeSensor } from "css-element-queries";
  import { onMount } from "svelte";

  export let ctx: MainContext;
  export let component: Component;
  const elementLayout = ComponentLayout.create(ctx, component);

  let element: HTMLElement;

  onMount(() => {
    new ResizeSensor(element, () => {
      elementLayout.recalculate();
    });
  });
</script>

<div>
  <TreeView {elementLayout}>
    <div bind:this={element}>
      <ComponentView {ctx} {component} {elementLayout} />
    </div>
  </TreeView>
</div>

<style></style>
