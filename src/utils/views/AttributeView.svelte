<script lang="ts">
  import { map } from "rxjs";
  import type { Attribute } from "src/ex-object/ExObject";
  import ExprView from "./ExprView.svelte";
  import type MainContext from "src/main-context/MainContext";
  import SelectableView from "src/utils/utils/SelectableView.svelte";
  import TreeView from "../layout/TreeView.svelte";
  import ExprLayout from "../layout/ExprLayout";

  export let ctx: MainContext;
  export let attribute: Attribute;

  let expr$ = attribute.expr$;
  const exprId$ = expr$.pipe(map((expr) => expr.id));

  // Hmmm... this seems inefficient
  const elementLayout$ = expr$.pipe(
    map((expr) => ExprLayout.create(ctx, expr))
  );
</script>

<main>
  <SelectableView {ctx} object={attribute}>
    <div>Attribute</div>
    {#key $exprId$}
      {#if $elementLayout$}
        <TreeView elementLayout={$elementLayout$}>
          <ExprView {ctx} expr={$expr$} elementLayout={$elementLayout$} />
        </TreeView>
      {/if}
    {/key}
  </SelectableView>
</main>
