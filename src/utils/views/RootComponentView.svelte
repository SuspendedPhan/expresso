<script lang="ts">
  import { ResizeSensor } from "css-element-queries";
  import type { Component } from "src/ex-object/ExObject";
  import MainContext from "src/main-context/MainContext";
  import { onMount, tick } from "svelte";
  import ElementLayout from "../layout/ComponentLayout";
  import ComponentView from "./ComponentView.svelte";

  export let ctx: MainContext;
  export let component: Component;
  let clazz = "";
  export { clazz as class };

  let element: HTMLElement;

  onMount(() => {
    new ResizeSensor(element, () => {
      tick().then(() => {
        elementLayout.recalculate();
      });
    });
  });

  const layout = new ElementLayout(component);
  const components$ = ctx.eventBus.getDescendants$(component);
</script>

<div class={clazz}>
  {#each $components$ as component}
    <ComponentView {ctx} {component} {layout} />
  {/each}
</div>

<style></style>
