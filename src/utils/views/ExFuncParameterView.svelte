<script lang="ts">
  import type { ExFuncParameter } from "src/ex-object/ExFunc";

  import { createFieldValueData } from "src/utils/views/Field";
  import FieldValue from "src/utils/views/FieldValue.svelte";

  export let parameter: ExFuncParameter;
  const fieldValueData = createFieldValueData({
    ctx,
    value$: parameter.name$,
    focusIsFn: FocusKind.is.ExFuncParameter,
    createEditingFocusFn: (isEditing) =>
      FocusKind.ExFuncParameter({ parameter, isEditing }),
    filterFn: (f) => f.parameter === parameter,
  });
</script>

<FieldValue {ctx} fieldData={fieldValueData} />
