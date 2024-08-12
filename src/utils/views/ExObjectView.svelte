<script lang="ts">
  import { ComponentUtils } from "src/ex-object/Component";
  import { ExObjectFns, type ExObject } from "src/ex-object/ExObject";
  import type MainContext from "src/main-context/MainContext";
  import { ExObjectFocus } from "src/utils/utils/Focus";
  import SelectableView from "src/utils/utils/SelectableView.svelte";
  import ExObjectButton from "src/utils/views/ExObjectButton.svelte";
  import ExObjectHeaderView from "src/utils/views/ExObjectHeaderView.svelte";
  import FocusView from "src/utils/views/FocusView.svelte";
  import type { ElementLayout } from "../layout/ElementLayout";
  import NodeView from "../layout/NodeView.svelte";
  import PropertyView from "./PropertyView.svelte";
  import HugInput from "src/utils/views/HugInput.svelte";
  import { firstValueFrom } from "rxjs";

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

  const exObjectName$ = exObject.name$;
  const exObjectNameFocused$ = ExObjectFocus.Name.isFocused$(ctx, exObject);
  const isEditingExObjectName$ = ExObjectFocus.Name.isEditing$(ctx, exObject);
  const componentName$ = ComponentUtils.getName$(exObject.component);
  const componentNameFocused$ = ExObjectFocus.Component.isFocused$(
    ctx,
    exObject
  );

  async function handleExObjectNameInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    if (value === "") {
      target.value = await firstValueFrom(exObjectName$);
      return;
    }
    exObject.name$.next(target.value);
  }

  function handleClickExObjectName() {
    console.log("handleClickExObjectName");

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
            <FocusView
              on:mousedown={handleClickExObjectName}
              focused={$exObjectNameFocused$}
              class="text-emphatic"
            >
              <HugInput
                isEditing={$isEditingExObjectName$}
                on:input={handleExObjectNameInput}
                value={$exObjectName$}
              ></HugInput>
            </FocusView>
          </div>
          <div class="flex flex-row">
            <pre class="text-style-secondary">Component: </pre>
            <FocusView
              on:mousedown={handleClickComponentName}
              focused={$componentNameFocused$}
              class="text-emphatic">{$componentName$}</FocusView
            >
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
        <ExObjectButton
          on:click={() => ExObjectFns.addBasicPropertyBlank(ctx, exObject)}
          class="mt-2">Add Property</ExObjectButton
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
