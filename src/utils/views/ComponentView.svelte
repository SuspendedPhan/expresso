<script lang="ts">
  import { ComponentFns, type CustomComponent } from "src/ex-object/Component";
  import type MainContext from "src/main-context/MainContext";
  import { FocusFns } from "src/utils/utils/Focus";
  import { Focus2Kind } from "src/utils/utils/FocusManager";
  import Divider from "src/utils/views/Divider.svelte";
  import Field from "src/utils/views/Field.svelte";
  import FlexContainer from "src/utils/views/FlexContainer.svelte";
  import FocusView from "src/utils/views/FocusView.svelte";
  import RootExObjectView from "src/utils/views/RootExObjectView.svelte";
  export let ctx: MainContext;
  export let component: CustomComponent;

  const isComponentFocused$ = FocusFns.isFocus2Focused$(ctx, (focus2) => {
    return Focus2Kind.is.Component(focus2) && focus2.component === component;
  });

  const name$ = ComponentFns.getName$(component);
  const isNameFocused$ = FocusFns.isFocus2Focused$(
    ctx,
    Focus2Kind.is.ComponentName
  );
  const isEditingName$ = FocusFns.isFocus2Focused$(ctx, (focus2) => {
    return Focus2Kind.is.ComponentName(focus2) && focus2.isEditing;
  });
  const rootExObjects$ = component.rootExObjects$;

  function addExObject() {
    ComponentFns.addRootExObjectBlank(ctx, component);
  }

  function handleMouseDown() {
    FocusFns.focus(ctx, Focus2Kind.Component({ component }));
  }

  function handleMouseDownName() {
    FocusFns.focus(ctx, Focus2Kind.ComponentName({ isEditing: false }));
  }
</script>

<FlexContainer class="ex-card">
  <FocusView focused={$isComponentFocused$} on:mousedown={handleMouseDown}>
    <FlexContainer class="p-window" centered={false}>
      <Field
        label="Name"
        value$={name$}
        isFocused={$isNameFocused$}
        isEditing={$isEditingName$}
        on:mousedown={handleMouseDownName}
      />
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
