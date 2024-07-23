<script lang="ts">
  import type { Component } from "src/ex-object/ExObject";
  import type MainContext from "src/main-context/MainContext";
  import SelectableView from "src/utils/utils/SelectableView.svelte";
  import ElementLayout from "../layout/ComponentLayout";
  import NodeView from "../layout/NodeView.svelte";
  import AttributeView from "./AttributeView.svelte";

  export let ctx: MainContext;
  export let component: Component;
  export let layout: ElementLayout<Component>;
  const attributes = component.sceneAttributeByProto.values();
  const children$ = component.children$;
</script>

<NodeView layoutObject={component} elementLayout={layout}>
  <div>
    <SelectableView
      {ctx}
      object={component}
      class="card p-6 bg-white rounded-sm card-bordered card-compact w-max"
    >
      <div class="">{component.id}</div>
      <div class="divider"></div>
      <div class="flex flex-col items-center">
        {#each attributes as attribute (attribute.id)}
          <div>
            <AttributeView {ctx} {attribute} />
          </div>
        {/each}
        <button
          on:click={() => ctx.componentMutator.addChild(component)}
          class="btn mt-6">Add Child</button
        >
      </div>
    </SelectableView>
    {#if $children$}
      {#each $children$ as child (child.id)}
        <svelte:self {ctx} component={child} {layout} />
      {/each}
    {/if}
  </div>
</NodeView>
