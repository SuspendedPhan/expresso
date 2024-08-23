<script lang="ts">
  import { of } from "rxjs";
  import { ComponentFns, type CustomComponent } from "src/ex-object/Component";
  import type MainContext from "src/main-context/MainContext";
  import { FocusKind } from "src/utils/focus/FocusKind";
  import ComponentParameterView from "src/utils/views/ComponentParameterView.svelte";
  import Divider from "src/utils/views/Divider.svelte";
  import { createFieldData } from "src/utils/views/Field";
  import Field from "src/utils/views/Field.svelte";
  import FieldLabel from "src/utils/views/FieldLabel.svelte";
  import FlexContainer from "src/utils/views/FlexContainer.svelte";
  import FocusView from "src/utils/views/FocusView.svelte";
  import RootExObjectView from "src/utils/views/RootExObjectView.svelte";

  export let ctx: MainContext;
  export let component: CustomComponent;

  const isComponentFocused$ = of(false);

  const nameFieldData = createFieldData({
    ctx,
    label: "Name",
    value$: component.name$,
    focusIsFn: FocusKind.is.ComponentName,
    createEditingFocusFn: (isEditing: boolean) =>
      FocusKind.ComponentName({ component, isEditing }),
    filterFn: (f) => f.component === component,
  });

  const rootExObjects$ = component.rootExObjects$;

  function addExObject() {
    ComponentFns.addRootExObjectBlank(ctx, component);
  }

  function handleMouseDown() {}

  const parameters$ = component.parameters$;
</script>

<FlexContainer class="ex-card">
  <FocusView focused={$isComponentFocused$} on:mousedown={handleMouseDown}>
    <FlexContainer class="p-window gap-2" centered={false}>
      <Field {ctx} fieldData={nameFieldData} />
      <div class="flex">
        <FieldLabel label="Parameters" />
        {#each $parameters$ as parameter (parameter.id)}
          <ComponentParameterView {ctx} {parameter} />
        {/each}
      </div>
    </FlexContainer>

    <FlexContainer>
      {#each $rootExObjects$ as rootExObject}
        <Divider />
        <RootExObjectView {ctx} exObject={rootExObject} />
      {/each}
    </FlexContainer>
    <Divider />
    <FlexContainer class="p-window">
      <button class="btn btn-sm w-max" on:click={addExObject}
        >Add Root Object</button
      >
    </FlexContainer>
  </FocusView>
</FlexContainer>
