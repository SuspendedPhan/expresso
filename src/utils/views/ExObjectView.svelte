<script lang="ts">
  import { ComponentFns } from "src/ex-object/Component";
  import { ExObjectFns, type ExObject } from "src/ex-object/ExObject";
  import type MainContext from "src/main-context/MainContext";
  import { ExObjectFocus } from "src/utils/utils/Focus";
  import SelectableView from "src/utils/utils/SelectableView.svelte";
  import ExObjectButton from "src/utils/views/ExObjectButton.svelte";
  import ExObjectHeaderView from "src/utils/views/ExObjectHeaderView.svelte";
  import Field from "src/utils/views/Field.svelte";
  import type { ElementLayout } from "../layout/ElementLayout";
  import NodeView from "../layout/NodeView.svelte";
  import PropertyView from "./PropertyView.svelte";

  export let ctx: MainContext;
  export let exObject: ExObject;
  export let elementLayout: ElementLayout;

  const componentParameterProperties = exObject.componentParameterProperties;
  const cloneCountProperty = exObject.cloneCountProperty;
  const basicProperties$ = exObject.basicProperties$;
  const children$ = exObject.children$;

  const exObjectName$ = exObject.name$;
  const exObjectNameFocused$ = ExObjectFocus.Name.isFocused$(ctx, exObject);
  const isEditingExObjectName$ = ExObjectFocus.Name.isEditing$(ctx, exObject);
  const componentName$ = ComponentFns.getName$(exObject.component);
  const componentNameFocused$ = ExObjectFocus.Component.isFocused$(
    ctx,
    exObject
  );

  function handleClickExObjectName() {
    ctx.focusManager.focus(
      new ExObjectFocus.Name({
        exObject,
        isEditing: false,
      })
    );
  }

  function handleClickComponentName() {
    ctx.focusManager.focus(
      new ExObjectFocus.Component({
        exObject,
        isEditing: false,
      })
    );
  }
</script>

<NodeView elementKey={exObject.id} {elementLayout}>
  <div>
    <SelectableView {ctx} item={exObject} class="ex-card w-max flex flex-col">
      <div class="p-4 flex flex-col">
        <ExObjectHeaderView>Basics</ExObjectHeaderView>
        <div class="flex flex-col gap-2 font-mono">
          <Field
            label="Name"
            value$={exObjectName$}
            isFocused={$exObjectNameFocused$}
            isEditing={$isEditingExObjectName$}
            on:mousedown={handleClickExObjectName}
          />
          <Field
            label="Component"
            value$={componentName$}
            isFocused={$componentNameFocused$}
            isEditing={false}
            on:mousedown={handleClickComponentName}
          />
        </div>
      </div>

      <!-- Divider -->
      <div class="divider m-0 h-0"></div>
      <div class="p-4">
        <ExObjectHeaderView>Component Arguments</ExObjectHeaderView>
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
        <!-- if len 0 -->
        {#if $basicProperties$.length > 0}
          <ExObjectHeaderView>Properties</ExObjectHeaderView>
        {/if}
        {#each $basicProperties$ as property (property.id)}
          <PropertyView {ctx} {property} />
        {/each}
        <ExObjectButton
          on:click={() => ExObjectFns.addBasicPropertyBlank(ctx, exObject)}
          class={$basicProperties$.length > 0 ? "mt-2" : ""}
          >Add Property</ExObjectButton
        >
      </div>

      <!-- Divider -->
      <div class="divider m-0 h-0"></div>
      <div class="p-4 self-center">
        <ExObjectButton
          on:click={() => ExObjectFns.addChildBlank(ctx, exObject)}
          >Add Child Object</ExObjectButton
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
