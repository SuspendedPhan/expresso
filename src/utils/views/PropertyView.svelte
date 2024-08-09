<script lang="ts">
  import { map } from "rxjs";
  import type MainContext from "src/main-context/MainContext";
  import SelectableView from "src/utils/utils/SelectableView.svelte";
  import ExprLayout from "../layout/ExprLayout";
  import TreeView from "../layout/TreeView.svelte";
  import ExprView from "./ExprView.svelte";
  import { PropertyUtils, type Property } from "src/ex-object/Property";
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
</script>

<div class:flex={$isNumberExpr$} class="items-center gap-1">
  <SelectableView {ctx} item={property}>
    <div class="text-left" class:mb-2={!$isNumberExpr$}>
      <input class="font-semibold" value={$name$} /> =
    </div>
  </SelectableView>
  {#key $exprId$}
    {#if $elementLayout$}
      <TreeView elementLayout={$elementLayout$} {ctx}>
        <ExprView {ctx} expr={$expr$} elementLayout={$elementLayout$} />
      </TreeView>
    {/if}
  {/key}
</div>
