<script lang="ts">
  import type { Component } from "src/ex-object/ExObject";
  import type MainContext from "src/main-context/MainContext";
  import SelectableView from "src/utils/utils/SelectableView.svelte";
  import { ElementLayout } from "../layout/ElementLayout";
  import NodeView from "../layout/NodeView.svelte";
  import AttributeView from "./AttributeView.svelte";

  export let ctx: MainContext;
  export let component: Component;
  export let elementLayout: ElementLayout;
  const attributes = component.sceneAttributeByProto.values();
  const children$ = component.children$;
</script>

<NodeView elementKey={component.id} {elementLayout}>
  <div class="border border-black p-4 bg-white">
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
</NodeView>
