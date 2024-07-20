<script lang="ts">
  import type { Component } from "src/ex-object/ExObject";
  import type MainContext from "src/main-context/MainContext";
  import SelectableView from "src/utils/utils/SelectableView.svelte";
  import AttributeView from "./AttributeView.svelte";
  import { onMount } from "svelte";
  import { ElementLayout } from "../layout/ElementLayout";

  export let ctx: MainContext;
  export let component: Component;
  export let elementLayout: ElementLayout;
  const attributes = component.sceneAttributeByProto.values();
  const children$ = component.children$;
  children$.subscribe((children) => {
    console.log("children$ changed", children);
  });

  let element: HTMLElement;
  onMount(() => {
    elementLayout.registerElement(element, component.id);
    elementLayout
      .getLocalPositionObservable(component.id)
      .subscribe((position) => {
        element.style.left = `${position.left}px`;
        element.style.top = `${position.top}px`;
      });
    elementLayout.recalculate();
  });
</script>

<div class="absolute inline-block" bind:this={element}>
  <div class="border border-black p-4">
    <SelectableView {ctx} object={component}>
      <button on:click={() => ctx.componentMutator.addChild(component)}
        >Add Child</button
      >
      <div>Component {component.id}</div>
      {#each attributes as attribute (attribute.id)}
        <div>
          <AttributeView {ctx} {attribute} />
        </div>
      {/each}
    </SelectableView>
    {#if $children$}
      {#each $children$ as child (child.id)}
        <svelte:self {ctx} component={child} {elementLayout} />
      {/each}
    {/if}
  </div>
</div>
