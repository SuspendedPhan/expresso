<script lang="ts">
  import { MutateExObject, type ExObject } from "src/ex-object/ExObject";
  import type MainContext from "src/main-context/MainContext";
  import SelectableView from "src/utils/utils/SelectableView.svelte";
  import NodeView from "../layout/NodeView.svelte";
  import PropertyView from "./PropertyView.svelte";
  import type { ElementLayout } from "../layout/ElementLayout";
  import { ComponentUtils } from "src/ex-object/Component";
  import ExObjectHeaderView from "src/utils/views/ExObjectHeaderView.svelte";

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
      class="card bg-white rounded-sm card-bordered border-2 border-base-content/10 card-compact w-max flex flex-col"
    >
      <div class="p-4 flex flex-col">
        <ExObjectHeaderView>Basics</ExObjectHeaderView>
        <div class="flex flex-col gap-2 font-mono">
          <div class="flex flex-row">
            <pre class="text-style-secondary">Name: </pre>
            <div class="text-emphatic">ExObject {exObject.ordinal}</div>
          </div>
          <div class="flex flex-row">
            <pre class="text-style-secondary">Component: </pre>
            <div class="text-emphatic">{$componentName$}</div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="divider m-0 h-0"></div>
      <div class="p-4">
        <ExObjectHeaderView>Component Properties</ExObjectHeaderView>
        <div class="flex flex-col gap-2">
          <PropertyView {ctx} property={cloneCountProperty} />
          {#each componentParameterProperties as property (property.id)}
            <PropertyView {ctx} {property} />
          {/each}
        </div>
      </div>

      <!-- Divider -->
      <div class="divider m-0 h-0"></div>
      <div class="flex flex-col gap-2 p-4">
        <ExObjectHeaderView>Standard Properties</ExObjectHeaderView>
        {#each $basicProperties$ as property (property.id)}
          <PropertyView {ctx} {property} />
        {/each}
        <button
          on:click={() => MutateExObject.addBasicPropertyBlank(ctx, exObject)}
          class="btn btn-sm text-sm w-max self-center mt-2">Add Property</button
        >
      </div>

      <!-- Divider -->
      <div class="divider m-0 h-0"></div>
      <div class="p-4 self-center">
        <button
          on:click={() => MutateExObject.addChildBlank(ctx, exObject)}
          class="btn btn-sm text-sm w-max">Add Child Object</button
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
