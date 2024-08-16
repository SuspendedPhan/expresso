<script lang="ts">
  import { of } from "rxjs";
  import { ComponentFns } from "src/ex-object/Component";
  import { ExObjectFns, type ExObject } from "src/ex-object/ExObject";
  import type MainContext from "src/main-context/MainContext";
  import { rxEquals, type OBS } from "src/utils/utils/Utils";
  import ExObjectButton from "src/utils/views/ExObjectButton.svelte";
  import ExObjectHeaderView from "src/utils/views/ExObjectHeaderView.svelte";
  import Field from "src/utils/views/Field.svelte";
  import FocusView from "src/utils/views/FocusView.svelte";
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

  function equals$(exObject$: OBS<ExObject | false>) {
    return exObject$.pipe(rxEquals(exObject));
  }

  const exObjectFocused$ = equals$(
    ctx.focusCtx.exObjectFocusCtx.exObjectFocus$
  );
  const exObjectName$ = exObject.name$;

  const exObjectNameFocused$ = equals$(
    ctx.focusCtx.exObjectFocusCtx.nameFocus$
  );

  const isEditingExObjectName$ = of(false);
  const componentName$ = ComponentFns.getName$(exObject.component);
  const componentNameFocused$ = equals$(
    ctx.focusCtx.exObjectFocusCtx.componentFocus$
  );

  function handleClickExObjectName() {}

  function handleClickComponentName() {}
</script>

<NodeView elementKey={exObject.id} {elementLayout}>
  <div>
    <FocusView focused={$exObjectFocused$} class="ex-card w-max flex flex-col">
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
        <ExObjectHeaderView>Component</ExObjectHeaderView>
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
    </FocusView>
    {#if $children$}
      {#each $children$ as child (child.id)}
        <svelte:self {ctx} exObject={child} {elementLayout} />
      {/each}
    {/if}
  </div>
</NodeView>
