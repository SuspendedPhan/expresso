<script lang="ts">
  import { of } from "rxjs";
  import { ComponentFns, type CustomComponent } from "src/ex-object/Component";
  import type MainContext from "src/main-context/MainContext";
  import Divider from "src/utils/views/Divider.svelte";
  import Field from "src/utils/views/Field.svelte";
  import FieldLabel from "src/utils/views/FieldLabel.svelte";
  import FlexContainer from "src/utils/views/FlexContainer.svelte";
  import FocusView from "src/utils/views/FocusView.svelte";
  import RootExObjectView from "src/utils/views/RootExObjectView.svelte";
  import HugInput from "src/utils/views/HugInput.svelte";
  import ComponentParameterView from "src/utils/views/ComponentParameterView.svelte";

  export let ctx: MainContext;
  export let component: CustomComponent;

  const isComponentFocused$ = of(false);

  const name$ = ComponentFns.getName$(component);
  const isNameFocused$ = of(false);
  const isEditingName$ = of(false);
  const rootExObjects$ = component.rootExObjects$;

  function addExObject() {
    ComponentFns.addRootExObjectBlank(ctx, component);
  }

  function handleMouseDown() {}

  function handleMouseDownName() {}

  const parameters$ = component.parameters$;
</script>

<FlexContainer class="ex-card">
  <FocusView focused={$isComponentFocused$} on:mousedown={handleMouseDown}>
    <FlexContainer class="p-window gap-2" centered={false}>
      <Field
        label="Name"
        value$={name$}
        isFocused={$isNameFocused$}
        isEditing={$isEditingName$}
        on:mousedown={handleMouseDownName}
      />
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
