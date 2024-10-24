<script lang="ts">
  import { match } from "ts-pattern";
  import type { DexExpr } from "./DexDomain";
  import { ComboboxFocusTarget, FocusKind } from "./DexFocus";
  import FocusView from "./FocusView.svelte";
  import type { ElementLayout } from "./utils/layout/ElementLayout";
  import NodeView from "./utils/layout/NodeView.svelte";

  export let expr: DexExpr;
  export let elementLayout: ElementLayout;

  const text = match(expr)
    .with({ _tag: "NumberExpr" }, (e) => e.value.toString())
    .with({ _tag: "CallExpr" }, (e) => e.function.name)
    .with({ _tag: "ReferenceExpr" }, (e) => e.target)
    .exhaustive();
</script>

<NodeView {elementLayout} elementKey={expr.id}>
  <FocusView target={ComboboxFocusTarget({ kind: FocusKind.Expr, targetId: expr.id })}>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    <div class="rounded-sm card card-compact card-bordered px-2 container bg-base-100 font-mono">
      <span>{text}</span>

      <div class="pl-2">
        {#each expr.children as child (child.id)}
          <svelte:self expr={child} {elementLayout} />
        {/each}
      </div>
    </div>
  </FocusView>

  <!-- <ExprSelect {expr} /> -->
</NodeView>
