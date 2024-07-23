<script lang="ts">
  import type { Component } from "src/ex-object/ExObject";
  import MainContext from "src/main-context/MainContext";
  import ComponentLayout, {
    ComponentViewFactory,
    ComponentViewLayoutOutput,
  } from "../layout/ComponentLayout";
  import TreeView from "../layout/TreeView.svelte";
  import ComponentView from "./ComponentView.svelte";
  import { ResizeSensor } from "css-element-queries";
  import { onMount, tick } from "svelte";
  import { Layout, Node } from "../layout/Layout";
  import { map, Subject } from "rxjs";

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

  const factory: ComponentViewFactory = (
    output: ComponentViewLayoutOutput
  ) => {};
  const componentLayout = new ComponentLayout(component, factory);

  let components: {
    component: Component;
    view: ComponentView;
  }[] = [];
</script>

<div class={clazz}>
  <TreeView {elementLayout}>
    <div bind:this={element}>
      <ComponentView {ctx} {component} {elementLayout} />
    </div>
  </TreeView>

  {#each components as cc}
    <ComponentView
      {ctx}
      component={cc.component}
      {elementLayout}
      bind:this={cc.view}
    />
  {/each}
</div>

<style></style>
