<script lang="ts">
  import { map } from "rxjs";
  import type { SceneAttribute } from "src/ex-object/ExObject";
  import type MainContext from "src/main-context/MainContext";
  import SelectableView from "src/utils/utils/SelectableView.svelte";
  import ExprLayout from "../layout/ExprLayout";
  import TreeView from "../layout/TreeView.svelte";
  import ExprView from "./ExprView.svelte";

  export let ctx: MainContext;
  export let attribute: SceneAttribute;
  let name = attribute.proto.name;

  let expr$ = attribute.expr$;
  const exprId$ = expr$.pipe(map((expr) => expr.id));

  // Hmmm... this seems inefficient
  const elementLayout$ = expr$.pipe(
    map((expr) => ExprLayout.create(ctx, expr))
  );
</script>

<div>
  <SelectableView {ctx} object={attribute} class="mb-4">
    <div class="text-center">{name}</div>
  </SelectableView>
  {#key $exprId$}
    {#if $elementLayout$}
      <TreeView elementLayout={$elementLayout$}>
        <ExprView {ctx} expr={$expr$} elementLayout={$elementLayout$} />
      </TreeView>
    {/if}
  {/key}
</div>
