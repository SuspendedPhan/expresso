<script lang="ts">
  import { MutateExObject, type ExObject } from "src/ex-object/ExObject";
  import type MainContext from "src/main-context/MainContext";
  import SelectableView from "src/utils/utils/SelectableView.svelte";
  import NodeView from "../layout/NodeView.svelte";
  import PropertyView from "./PropertyView.svelte";
  import type { ElementLayout } from "../layout/ElementLayout";
  import { ComponentUtils } from "src/ex-object/Component";

  export let ctx: MainContext;
  export let exObject: ExObject;
  export let elementLayout: ElementLayout;
  const componentParameterProperties = exObject.componentParameterProperties;
  const cloneCountProperty = exObject.cloneCountProperty;
  const basicProperties$ = exObject.basicProperties$;
  exObject.basicProperties$.subscribe((basicProperties) => {
    console.log("basicProperties", basicProperties);
  });
  const componentName$ = ComponentUtils.getName$(exObject.component);
  const children$ = exObject.children$;
</script>

<NodeView elementKey={exObject.id} {elementLayout}>
  <div>
    <SelectableView
      {ctx}
      item={exObject}
      class="card bg-white rounded-sm card-bordered card-compact w-max flex flex-col"
    >
      <div class="p-4">
        <div class="text-lg">ExObject {exObject.ordinal}</div>
      </div>

      <!-- Divider -->
      <div class="divider m-0" style="min-width: 200px;">Component</div>
      <div class="p-4">
        <div class="mb-4">
          {$componentName$}
        </div>
        <div class="flex flex-col gap-2">
          {#each componentParameterProperties as property (property.id)}
            <PropertyView {ctx} {property} />
          {/each}
          <PropertyView {ctx} property={cloneCountProperty} />
        </div>
      </div>

      <!-- Divider -->
      <div class="divider m-0">Properties</div>
      <div class="flex flex-col gap-2 p-4">
        {#each $basicProperties$ as property (property.id)}
          <PropertyView {ctx} {property} />
        {/each}
        <button
          on:click={() => MutateExObject.addBasicPropertyBlank(ctx, exObject)}
          class="btn self-center justify-self-center">Add Property</button
        >
      </div>

      <div class="divider m-0"></div>

      <div class="self-center">
        <button
          on:click={() => MutateExObject.addChildBlank(ctx, exObject)}
          class="btn">Add Child</button
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
