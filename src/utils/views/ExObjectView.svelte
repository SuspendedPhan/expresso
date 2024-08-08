<script lang="ts">
  import { MutateExObject, type ExObject } from "src/ex-object/ExObject";
  import type MainContext from "src/main-context/MainContext";
  import SelectableView from "src/utils/utils/SelectableView.svelte";
  import NodeView from "../layout/NodeView.svelte";
  import PropertyView from "./PropertyView.svelte";
  import type { ElementLayout } from "../layout/ElementLayout";

  export let ctx: MainContext;
  export let exObject: ExObject;
  export let elementLayout: ElementLayout;
  const componentParameterProperties = exObject.componentParameterProperties;
  const cloneCountProperty = exObject.cloneCountProperty;
  const basicProperties$ = exObject.basicProperties$;
  exObject.basicProperties$.subscribe((basicProperties) => {
    console.log("basicProperties", basicProperties);
  });
  const children$ = exObject.children$;
</script>

<NodeView elementKey={exObject.id} {elementLayout}>
  <div>
    <SelectableView
      {ctx}
      item={exObject}
      class="card p-6 bg-white rounded-sm card-bordered card-compact w-max"
    >
      <div class="">ExObject {exObject.ordinal}</div>
      <div class="divider"></div>
      <div class="">
        <div class="flex flex-col gap-4">
          {#each componentParameterProperties as property (property.id)}
            <PropertyView {ctx} {property} />
          {/each}
          <PropertyView {ctx} property={cloneCountProperty} />
        </div>
        <div class="divider"></div>
        {#each $basicProperties$ as property (property.id)}
          <PropertyView {ctx} {property} />
        {/each}

        <button
          on:click={() => MutateExObject.addChildBlank(ctx, exObject)}
          class="btn mt-6">Add Child</button
        >
      </div>
    </SelectableView>
    {#if $children$}
      {#each $children$ as child (child.id)}
        <svelte:self {ctx} exObject={child} {elementLayout} />
      {/each}
    {/if}
  </div>
</NodeView>
