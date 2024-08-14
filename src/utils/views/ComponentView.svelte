<script lang="ts">
  import { ComponentFns, type CustomComponent } from "src/ex-object/Component";
  import type MainContext from "src/main-context/MainContext";
  import { FocusFns } from "src/utils/utils/Focus";
  import { Focus2Union } from "src/utils/utils/FocusManager";
  import Field from "src/utils/views/Field.svelte";
  import FlexContainer from "src/utils/views/FlexContainer.svelte";
  import RootExObjectView from "src/utils/views/RootExObjectView.svelte";
  export let ctx: MainContext;
  export let component: CustomComponent;

  const name$ = ComponentFns.getName$(component);
  const isNameFocused$ = FocusFns.isFocus2Focused$(
    ctx,
    Focus2Union.is.ComponentName
  );
  const isEditingName$ = FocusFns.isFocus2Focused$(ctx, (focus2) => {
    return Focus2Union.is.ComponentName(focus2) && focus2.isEditing;
  });
  const rootExObjects$ = component.rootExObjects$;

  function addExObject() {
    ComponentFns.addRootExObjectBlank(ctx, component);
  }

  function handleMouseDownName() {
    FocusFns.focus(ctx, Focus2Union.ComponentName({ isEditing: false }));
  }
</script>

<FlexContainer class="p-window ex-card">
  <Field
    label="Name"
    value$={name$}
    isFocused={$isNameFocused$}
    isEditing={$isEditingName$}
    on:mousedown={handleMouseDownName}
  />
  <button class="btn btn-sm w-max" on:click={addExObject}>Add Object</button>
  <FlexContainer>
    {#each $rootExObjects$ as rootExObject}
      <RootExObjectView {ctx} exObject={rootExObject} />
    {/each}
  </FlexContainer>
</FlexContainer>
