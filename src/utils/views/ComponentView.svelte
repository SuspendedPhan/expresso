<script lang="ts">
  import { of } from "rxjs";
  import { ComponentFns, type CustomComponent } from "src/ex-object/Component";
  import type MainContext from "src/main-context/MainContext";
  import { FocusKind } from "src/utils/focus/FocusKind";
  import { ObservableArrayFns } from "src/utils/utils/ObservableArray";
  import BasicPropertyList from "src/utils/views/BasicPropertyList.svelte";
  import Divider from "src/utils/views/Divider.svelte";
  import ExObjectButton from "src/utils/views/ExObjectButton.svelte";
  import { createFieldData, createFieldValueData } from "src/utils/views/Field";
  import Field from "src/utils/views/Field.svelte";
  import FlexContainer from "src/utils/views/FlexContainer.svelte";
  import FocusView from "src/utils/views/FocusView.svelte";
  import ListInput from "src/utils/views/ListInput.svelte";
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

  const parameterFieldValueArr$ = ObservableArrayFns.map2(
    component.parameters$,
    (parameter) => {
      return createFieldValueData({
        ctx,
        value$: parameter.name$,
        focusIsFn: FocusKind.is.ComponentParameter,
        createEditingFocusFn: (isEditing) =>
          FocusKind.ComponentParameter({ parameter, isEditing }),
        filterFn: (f) => f.parameter === parameter,
      });
    }
  );

  function addParameter() {
    component.addParameterBlank();
  }
</script>

<FlexContainer class="ex-card">
  <FocusView focused={$isComponentFocused$} on:mousedown={handleMouseDown}>
    <FlexContainer class="p-4 gap-2" centered={false}>
      <Field {ctx} fieldData={nameFieldData} />
      <ListInput
        {ctx}
        label="Parameters"
        fieldValueDataArr$={parameterFieldValueArr$}
      />
      <ExObjectButton class="mt-2" on:click={addParameter}
        >Add Parameter</ExObjectButton
      >
    </FlexContainer>

    <Divider />

    <FlexContainer centered={false} class="p-4 flex flex-col">
      <BasicPropertyList
        {ctx}
        basicProperties$={component.properties$}
        addPropertyFn={() => {
          component.addPropertyBlank();
        }}
      />
    </FlexContainer>

    <FlexContainer>
      {#each $rootExObjects$ as rootExObject}
        <Divider />
        <RootExObjectView {ctx} exObject={rootExObject} />
      {/each}
    </FlexContainer>
    <Divider />
    <FlexContainer class="p-4">
      <button class="btn btn-sm w-max" on:click={addExObject}
        >Add Root Object</button
      >
    </FlexContainer>
  </FocusView>
</FlexContainer>
