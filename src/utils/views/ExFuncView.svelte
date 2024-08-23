<script lang="ts">
  import { of } from "rxjs";
  import type { ExFunc } from "src/ex-object/ExFunc";
  import type MainContext from "src/main-context/MainContext";
  import { FocusKind } from "src/utils/focus/FocusKind";
  import Divider from "src/utils/views/Divider.svelte";
  import { createFieldData } from "src/utils/views/Field";
  import Field from "src/utils/views/Field.svelte";
  import FlexContainer from "src/utils/views/FlexContainer.svelte";
  import FocusView from "src/utils/views/FocusView.svelte";
  import RootExprView from "src/utils/views/RootExprView.svelte";
  export let ctx: MainContext;
  export let exFunc: ExFunc;

  const isExFuncFocused$ = of(false);

  const nameFieldData = createFieldData({
    label: "Name",
    value$: exFunc.name$,
    createEditingFocusFn: (isEditing) => {
      return FocusKind.ExFuncName({ exFunc, isEditing });
    },
    ctx,
    focusIsFn: FocusKind.is.ExFuncName,
    filterFn: (f) => f.exFunc === exFunc,
  });

  const expr$ = exFunc.expr$;

  function addExObject() {
    ExFuncFns.addRootExObjectBlank(ctx, exFunc);
  }

  function handleMouseDown() {}
</script>

<FlexContainer class="ex-card">
  <FocusView focused={$isExFuncFocused$} on:mousedown={handleMouseDown}>
    <FlexContainer class="p-window" centered={false}>
      <Field {ctx} fieldData={nameFieldData} />
    </FlexContainer>

    <Divider />

    <FlexContainer class="p-window">
      <RootExprView {ctx} expr={$expr$} />
    </FlexContainer>
  </FocusView>
</FlexContainer>
