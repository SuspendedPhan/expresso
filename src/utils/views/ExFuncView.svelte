<script lang="ts">
  import { map, of, pipe } from "rxjs";
  import type { ExFunc } from "src/ex-object/ExFunc";
  import type MainContext from "src/main-context/MainContext";
  import { FocusKind } from "src/utils/focus/FocusKind";
  import Divider from "src/utils/views/Divider.svelte";
  import ExFuncParameterView from "src/utils/views/ExFuncParameterView.svelte";
  import ExObjectButton from "src/utils/views/ExObjectButton.svelte";
  import { createFieldData } from "src/utils/views/Field";
  import Field from "src/utils/views/Field.svelte";
  import FieldLabel from "src/utils/views/FieldLabel.svelte";
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
  const exprId$ = expr$.pipe(map((expr) => expr.id));
  const parameterArr$ = exFunc.exFuncParameterArr$;

  function addExObject() {
    ExFuncFns.addRootExObjectBlank(ctx, exFunc);
  }

  function handleMouseDown() {}

  function addParameter() {
    exFunc.addParameterBlank();
  }
</script>

<FlexContainer class="ex-card">
  <FocusView focused={$isExFuncFocused$} on:mousedown={handleMouseDown}>
    <FlexContainer class="p-window flex flex-col gap-2" centered={false}>
      <Field {ctx} fieldData={nameFieldData} />
      <div class="flex">
        <FieldLabel label="Parameters" />
        <div class="flex gap-2">
          {#each $parameterArr$ as parameter (parameter.id)}
            <ExFuncParameterView {ctx} {parameter} />
          {/each}
        </div>
      </div>
      <ExObjectButton on:click={addParameter}>Add Parameter</ExObjectButton>
    </FlexContainer>

    <Divider />

    <FlexContainer class="p-window">
      {#key $exprId$}
        <RootExprView expr={$expr$} {ctx} />
      {/key}
    </FlexContainer>
  </FocusView>
</FlexContainer>
