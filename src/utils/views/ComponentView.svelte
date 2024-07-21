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
  <div class="card p-4 bg-white rounded-sm card-bordered card-compact">
    <SelectableView {ctx} object={component}>
      <div class="card-title">{component.id}</div>
      <div class="card-body">
        {#each attributes as attribute (attribute.id)}
          <div>
            <AttributeView {ctx} {attribute} />
          </div>
        {/each}
        <div class="card-actions">
          <button
            on:click={() => ctx.componentMutator.addChild(component)}
            class="btn mt-4">Add Child</button
          >
        </div>
      </div>
    </SelectableView>
    {#if $children$}
      {#each $children$ as child (child.id)}
        <svelte:self {ctx} component={child} {elementLayout} />
      {/each}
    {/if}
  </div>
</NodeView>
