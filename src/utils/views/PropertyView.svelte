<script lang="ts">
  import { map } from "rxjs";
  import type MainContext from "src/main-context/MainContext";
  import SelectableView from "src/utils/utils/SelectableView.svelte";
  import ExprLayout from "../layout/ExprLayout";
  import TreeView from "../layout/TreeView.svelte";
  import ExprView from "./ExprView.svelte";
  import {
    PropertyType,
    PropertyUtils,
    type Property,
  } from "src/ex-object/Property";
  import { ExprType } from "src/ex-object/ExItem";

  export let ctx: MainContext;
  export let property: Property;

  const name$ = PropertyUtils.getName$(property);

  const expr$ = property.expr$;
  const exprId$ = expr$.pipe(map((expr) => expr.id));

  const isNumberExpr$ = expr$.pipe(
    map((expr) => expr.exprType === ExprType.NumberExpr)
  );

  // Hmmm... this seems inefficient
  const elementLayout$ = expr$.pipe(
    map((expr) => ExprLayout.create(ctx, expr))
  );

  const editingName$ = ctx.focusManager
    .getFocus$()
    .pipe(
      map(
        (focus) =>
          focus.type === "EditPropertyName" && focus.property === property
      )
    );

  function handleNameInput(event: InputEvent) {
    const target = event.target as HTMLInputElement;
    const name = target.value;
    if (property.propertyType !== PropertyType.BasicProperty) {
      throw new Error("Cannot edit name of non-basic property");
    }

    property.name$.next(name);
  }
</script>

<div class:flex={$isNumberExpr$} class="items-center gap-1 font-mono">
  <SelectableView {ctx} item={property} class="w-max grow-0">
    <div class="text-left relative" class:mb-2={!$isNumberExpr$}>
      <input
        class="font-semibold outline-none absolute left-0 w-full"
        class:ring={$editingName$}
        value={$name$}
        readonly={!$editingName$}
        on:input={handleNameInput}
      />
      <div class="font-semibold">{$name$}</div>
    </div>
  </SelectableView>
  <span>= </span>
  {#key $exprId$}
    {#if $elementLayout$}
      <TreeView elementLayout={$elementLayout$} {ctx}>
        <ExprView {ctx} expr={$expr$} elementLayout={$elementLayout$} />
      </TreeView>
    {/if}
  {/key}
</div>
