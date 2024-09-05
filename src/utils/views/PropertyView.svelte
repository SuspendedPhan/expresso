<script lang="ts">
  import { map, of } from "rxjs";
  import { ExprType } from "src/ex-object/ExItem";
  import {
    PropertyFns,
    PropertyType,
    type Property,
  } from "src/ex-object/Property";
  import type MainContext from "src/main-context/MainContext";
  import { rxEquals } from "src/utils/utils/Utils";
  import FocusView from "src/utils/views/FocusView.svelte";
  import HugInput from "src/utils/views/HugInput.svelte";
  import RootExprView from "src/utils/views/RootExprView.svelte";
  import ExprLayout from "../layout/ExprLayout";

  export let ctx: MainContext;
  export let property: Property;

  const name$ = PropertyFns.getName$(property);

  const expr$ = property.expr$;
  const exprId$ = expr$.pipe(map((expr) => expr.id));

  const isNumberExpr$ = expr$.pipe(
    map((expr) => expr.exprType === ExprType.NumberExpr)
  );

  // Hmmm... this seems inefficient
  const elementLayout$ = expr$.pipe(
    map((expr) => ExprLayout.create(ctx, expr))
  );

  const isFocused$ = ctx.exObjectFocusCtx.propertyFocus$.pipe(
    rxEquals(property)
  );
  const editingName$ = of(false);

  // todp
  function handleNameInput(event: Event) {
    const currentTarget = event.currentTarget as HTMLInputElement;
    const name = currentTarget.value;
    if (property.propertyType !== PropertyType.BasicProperty) {
      throw new Error("Cannot edit name of non-basic property");
    }

    property.name$.next(name);
  }
</script>

<div class:flex={$isNumberExpr$} class="items-center font-mono">
  <div class="flex flex-row">
    <FocusView focused={$isFocused$} class="w-max grow-0">
      <HugInput
        value={$name$}
        isEditing={$editingName$}
        on:input={handleNameInput}
      />
    </FocusView>
    <pre class="text-style-secondary"> = </pre>
  </div>

  {#key $exprId$}
    <RootExprView expr={$expr$} {ctx} />
  {/key}
</div>
