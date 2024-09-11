<script lang="ts">
  import { Effect } from "effect";
  import { map, of, switchAll } from "rxjs";
  import { Component, type ComponentKind } from "src/ex-object/Component";
  import {
    ComponentFocusFactory,
    type ComponentFocusKind,
  } from "src/focus/ComponentFocus";
  import { DexRuntime } from "src/utils/utils/DexRuntime";

  import { ObservableArrayFns } from "src/utils/utils/ObservableArray";
  import BasicPropertyList from "src/utils/views/BasicPropertyList.svelte";
  import Divider from "src/utils/views/Divider.svelte";
  import ExObjectButton from "src/utils/views/ExObjectButton.svelte";
  import {
    createFieldData,
    createFieldValueData,
    type FieldData,
  } from "src/utils/views/Field";
  import Field from "src/utils/views/Field.svelte";
  import FlexContainer from "src/utils/views/FlexContainer.svelte";
  import FocusView from "src/utils/views/FocusView.svelte";
  import ListInput from "src/utils/views/ListInput.svelte";
  import RootExObjectView from "src/utils/views/RootExObjectView.svelte";
  import { isType } from "variant";

  export let component: ComponentKind["Custom"];

  const isComponentFocused$ = of(false);

  let nameFieldData: FieldData;

  DexRuntime.runPromise(
    Effect.gen(function* () {
      nameFieldData = yield* createFieldData<ComponentFocusKind["Name"]>({
        label: "Name",
        value$: component.name$,
        focusIsFn: isType(ComponentFocusFactory.Name),
        createEditingFocusFn: (isEditing: boolean) =>
          ComponentFocusFactory.Name({ component, isEditing }),
        filterFn: (f) => f.component === component,
      });
    })
  );

  const rootExObjects$ = component.rootExObjects.items$;

  function addExObject() {
    DexRuntime.runPromise(Component.addRootExObjectBlank(component));
  }

  function handleMouseDown() {}

  const parameterFieldValueArr$ = ObservableArrayFns.map2(
    component.parameters,
    async (parameter) => {
      const effect = createFieldValueData<ComponentFocusKind["Parameter"]>({
        value$: parameter.name$,
        focusIsFn: isType(ComponentFocusFactory.Parameter),
        createEditingFocusFn: (isEditing) =>
          ComponentFocusFactory.Parameter({ parameter, isEditing }),
        filterFn: (f) => f.parameter === parameter,
      });
      const fieldValueData = await DexRuntime.runPromise(effect);
      return fieldValueData;
    }
  ).pipe(
    map(async (x) => {
      // Convert array of promise to array of value
      const xx = [];
      for await (const y of x) {
        xx.push(y);
      }
      return xx;
    }),
    switchAll()
  );

  function addParameter() {
    component.addParameterBlank();
  }
</script>

<FlexContainer class="ex-card">
  <FocusView focused={$isComponentFocused$} on:mousedown={handleMouseDown}>
    <FlexContainer class="p-4 gap-2" centered={false}>
      <Field fieldData={nameFieldData} />
      <ListInput
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
        basicProperties$={component.properties.items$}
        addPropertyFn={() => {
          component.addPropertyBlank();
        }}
      />
    </FlexContainer>

    <FlexContainer>
      {#each $rootExObjects$ as rootExObject}
        <Divider />
        <RootExObjectView exObject={rootExObject} />
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
