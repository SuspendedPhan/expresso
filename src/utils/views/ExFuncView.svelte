<script lang="ts">
  import { of } from "rxjs";
  import type { ExFunc } from "src/ex-object/ExFunc";
  import type MainContext from "src/main-context/MainContext";
  import Divider from "src/utils/views/Divider.svelte";
  import Field from "src/utils/views/Field.svelte";
  import FlexContainer from "src/utils/views/FlexContainer.svelte";
  import FocusView from "src/utils/views/FocusView.svelte";
  import RootExprView from "src/utils/views/RootExprView.svelte";
  export let ctx: MainContext;
  export let exFunc: ExFunc;

  const isExFuncFocused$ = of(false);

  const name$ = exFunc.name$;
  const isNameFocused$ = of(false);
  const isEditingName$ = of(false);
  const expr$ = exFunc.expr$;

  function addExObject() {
    ExFuncFns.addRootExObjectBlank(ctx, exFunc);
  }

  function handleMouseDown() {}

  function handleMouseDownName() {}
</script>

<FlexContainer class="ex-card">
  <FocusView focused={$isExFuncFocused$} on:mousedown={handleMouseDown}>
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
      <RootExprView {ctx} expr={$expr$} />
    </FlexContainer>
    <Divider />
    <FlexContainer class="p-window">
      <button class="btn btn-sm w-max" on:click={addExObject}
        >Add Root Object</button
      >
    </FlexContainer>
  </FocusView>
</FlexContainer>
