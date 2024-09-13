<script lang="ts">
  import { Effect } from "effect";
  import { map, of, switchAll } from "rxjs";
  import { type CustomExFunc } from "src/ex-object/ExFunc";
  import {
    ExFuncFocusFactory,
    type ExFuncFocusKind,
  } from "src/focus/ExFuncFocus";
  import { DexRuntime } from "src/utils/utils/DexRuntime";
  import { log5 } from "src/utils/utils/Log5";

  import { ObservableArrayFns } from "src/utils/utils/ObservableArray";
  import Divider from "src/utils/views/Divider.svelte";
  import ExObjectButton from "src/utils/views/ExObjectButton.svelte";
  import { createFieldData, type FieldData } from "src/utils/views/Field";
  import Field from "src/utils/views/Field.svelte";
  import FlexContainer from "src/utils/views/FlexContainer.svelte";
  import FocusView from "src/utils/views/FocusView.svelte";
  import ListInput from "src/utils/views/ListInput.svelte";
  import RootExprView from "src/utils/views/RootExprView.svelte";
  import { isType } from "variant";

  const log55 = log5("ExFuncView.svelte");

  export let exFunc: CustomExFunc;

  const isExFuncFocused$ = of(false);

  let nameFieldData: FieldData;
  DexRuntime.runPromise(
    Effect.gen(function* () {
      nameFieldData = yield* createFieldData<ExFuncFocusKind["Name"]>({
        label: "Name",
        value$: exFunc.name$,
        focusIsFn: isType(ExFuncFocusFactory.Name),
        createEditingFocusFn: (isEditing) =>
          ExFuncFocusFactory.Name({ exFunc, isEditing }),
        filterFn: (f) => f.exFunc === exFunc,
      });
      nameFieldData.value$.subscribe((value) => {
        console.log("nameFieldData.value$", value);
      });
      console.log("nameFieldData", nameFieldData.value$);
    })
  );

  const expr$ = exFunc.expr$;
  const exprId$ = expr$.pipe(map((expr) => expr.id));
  const parameterFieldDatas$ = ObservableArrayFns.map2(
    exFunc.parameters.items$,
    (parameter) => {
      const effect = createFieldData<ExFuncFocusKind["Parameter"]>({
        label: "Parameter",
        value$: parameter.name$,
        focusIsFn: isType(ExFuncFocusFactory.Parameter),
        createEditingFocusFn: (isEditing) =>
          ExFuncFocusFactory.Parameter({ parameter, isEditing }),
        filterFn: (f) => f.parameter === parameter,
      });
      return DexRuntime.runPromise(effect);
    }
  ).pipe(
    map(async (fieldDataArr) => {
      log55.debug("fieldDataArr", fieldDataArr);
      return await Promise.all(fieldDataArr);
    }),
    switchAll()
  );

  function handleMouseDown() {}

  function addParameter() {
    DexRuntime.runPromise(exFunc.addParameterBlank());
  }
</script>

<FlexContainer class="ex-card">
  <FocusView focused={$isExFuncFocused$} on:mousedown={handleMouseDown}>
    <FlexContainer class="p-card flex flex-col gap-2" centered={false}>
      <Field fieldData={nameFieldData} />
      <ListInput label="Parameters" fieldValueDataArr$={parameterFieldDatas$} />
      <ExObjectButton class="mt-2" on:click={addParameter}
        >Add Parameter</ExObjectButton
      >
    </FlexContainer>

    <Divider />

    <FlexContainer class="p-card">
      {#key $exprId$}
        <RootExprView expr={$expr$} />
      {/key}
    </FlexContainer>
  </FocusView>
</FlexContainer>
