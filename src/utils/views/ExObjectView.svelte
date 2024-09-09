<script lang="ts">
  import { ComponentFns } from "src/ex-object/Component";
  import { ExObjectFns, type ExObject } from "src/ex-object/ExObject";
  import type MainContext from "src/main-context/MainContext";

  import { rxEquals, type OBS } from "src/utils/utils/Utils";
  import ExObjectButton from "src/utils/views/ExObjectButton.svelte";
  import ExObjectHeaderView from "src/utils/views/ExObjectHeaderView.svelte";
  import {
    createFieldData,
    createReadonlyFieldData,
  } from "src/utils/views/Field";
  import Field from "src/utils/views/Field.svelte";
  import FocusView from "src/utils/views/FocusView.svelte";
  import type { ElementLayout } from "../layout/ElementLayout";
  import NodeView from "../layout/NodeView.svelte";
  import PropertyView from "./PropertyView.svelte";
  import BasicPropertyList from "src/utils/views/BasicPropertyList.svelte";
  import FlexContainer from "src/utils/views/FlexContainer.svelte";

  export let ctx: MainContext;
  export let exObject: ExObject;
  export let elementLayout: ElementLayout;

  const componentParameterProperties = exObject.componentParameterProperties;
  const cloneCountProperty = exObject.cloneCountProperty;
  const basicProperties$ = exObject.basicProperties;
  const children$ = exObject.children$;

  function equals$(exObject$: OBS<ExObject | false>) {
    return exObject$.pipe(rxEquals(exObject));
  }

  const exObjectFocused$ = equals$(ctx.exObjectFocusCtx.exObjectFocus$);
  const exObjectNameField = createFieldData({
    ctx,
    label: "Name",
    value$: exObject.name$,
    focusIsFn: FocusKind.is.ExObjectName,
    createEditingFocusFn: (isEditing) =>
      FocusKind.ExObjectName({ exObject, isEditing }),
    filterFn: (f) => f.exObject === exObject,
  });

  const componentField = createReadonlyFieldData({
    ctx,
    label: "Component",
    value$: ComponentFns.getName$(exObject.component),
    createFocusFn: () => FocusKind.ExObjectComponent({ exObject }),
    filterFn: (f) => f.exObject === exObject,
    focusIsFn: FocusKind.is.ExObjectComponent,
  });

  function handleClick() {
    ctx.focusCtx.setFocus(FocusKind.ExObject({ exObject }));
  }
</script>

<NodeView elementKey={exObject.id} {elementLayout}>
  <div>
    <FocusView
      focused={$exObjectFocused$}
      on:mousedown={handleClick}
      class="ex-card w-max flex flex-col"
    >
      <div class="p-card flex flex-col">
        <ExObjectHeaderView>Basics</ExObjectHeaderView>
        <div class="flex flex-col gap-2 font-mono">
          <Field {ctx} fieldData={exObjectNameField} />
          <Field {ctx} fieldData={componentField} />
        </div>
      </div>

      <!-- Divider -->
      <div class="divider m-0 h-0"></div>
      <div class="p-card">
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
      <FlexContainer centered={false} class="flex flex-col p-card">
        <BasicPropertyList
          {ctx}
          {basicProperties$}
          addPropertyFn={() => ExObjectFns.addBasicPropertyBlank(ctx, exObject)}
        />
      </FlexContainer>

      <!-- Divider -->
      <div class="divider m-0 h-0"></div>
      <div class="p-card self-center">
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
