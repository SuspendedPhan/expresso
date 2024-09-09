<script lang="ts">
  import { map, of } from "rxjs";
  import type { ExFunc } from "src/ex-object/ExFunc";
  import type MainContext from "src/main-context/MainContext";

  import { ObservableArrayFns } from "src/utils/utils/ObservableArray";
  import Divider from "src/utils/views/Divider.svelte";
  import ExFuncParameterView from "src/utils/views/ExFuncParameterView.svelte";
  import ExObjectButton from "src/utils/views/ExObjectButton.svelte";
  import { createFieldData } from "src/utils/views/Field";
  import Field from "src/utils/views/Field.svelte";
  import FieldLabel from "src/utils/views/FieldLabel.svelte";
  import FlexContainer from "src/utils/views/FlexContainer.svelte";
  import FocusView from "src/utils/views/FocusView.svelte";
  import ListInput from "src/utils/views/ListInput.svelte";
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
  const parameterFieldDataArr$ = ObservableArrayFns.map2(
    exFunc.exFuncParameterArr$,
    (parameter) => {
      return createFieldData({
        label: "Parameter",
        value$: parameter.name$,
        createEditingFocusFn: (isEditing) => {
          return FocusKind.ExFuncParameter({ parameter, isEditing });
        },
        ctx,
        focusIsFn: FocusKind.is.ExFuncParameter,
        filterFn: (f) => f.parameter === parameter,
      });
    }
  );

  function handleMouseDown() {}

  function addParameter() {
    exFunc.addParameterBlank();
  }
</script>

<FlexContainer class="ex-card">
  <FocusView focused={$isExFuncFocused$} on:mousedown={handleMouseDown}>
    <FlexContainer class="p-card flex flex-col gap-2" centered={false}>
      <Field {ctx} fieldData={nameFieldData} />
      <ListInput
        {ctx}
        label="Parameters"
        fieldValueDataArr$={parameterFieldDataArr$}
      />
      <ExObjectButton class="mt-2" on:click={addParameter}
        >Add Parameter</ExObjectButton
      >
    </FlexContainer>

    <Divider />

    <FlexContainer class="p-card">
      {#key $exprId$}
        <RootExprView expr={$expr$} {ctx} />
      {/key}
    </FlexContainer>
  </FocusView>
</FlexContainer>
