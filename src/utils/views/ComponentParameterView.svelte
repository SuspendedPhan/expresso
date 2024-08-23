<script lang="ts">
  import type { CustomComponentParameter } from "src/ex-object/Component";
  import type MainContext from "src/main-context/MainContext";
  import { FocusKind } from "src/utils/focus/FocusKind";
  import { createFieldValueData } from "src/utils/views/Field";
  import FieldValue from "src/utils/views/FieldValue.svelte";

  export let ctx: MainContext;
  export let parameter: CustomComponentParameter;
  const fieldValueData = createFieldValueData({
    ctx,
    value$: parameter.name$,
    focusIsFn: FocusKind.is.ComponentParameter,
    createEditingFocusFn: (isEditing) =>
      FocusKind.ComponentParameter({ parameter, isEditing }),
    filterFn: (f) => f.parameter === parameter,
  });
</script>

<FieldValue {ctx} fieldData={fieldValueData} />
