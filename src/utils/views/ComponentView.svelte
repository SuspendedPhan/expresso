<script lang="ts">
  import type { Component } from "src/ex-object/ExObject";
  import type MainContext from "src/main-context/MainContext";
  import SelectableView from "src/utils/utils/SelectableView.svelte";
  import AttributeView from "./AttributeView.svelte";

  export let ctx: MainContext;
  export let component: Component;
  const attributes = component.sceneAttributeByProto.values();
  const children$ = component.children$;
  children$.subscribe((children) => {
    console.log("children$ changed", children);
  });
</script>

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
      <svelte:self {ctx} component={child} />
    {/each}
  {/if}
</div>
