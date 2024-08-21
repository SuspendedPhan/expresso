<script lang="ts">
  import ExprLayout from "src/utils/layout/ExprLayout";
  import TreeView from "../layout/TreeView.svelte";
  import ExprView from "./ExprView.svelte";

  export let ctx;
  export let expr;
  const elementLayout = ExprLayout.create(ctx, expr);
  ctx.debugCtx.treeRoot = "expr " + expr.value;
</script>

<TreeView {elementLayout} {ctx}>
  <ExprView {ctx} {expr} {elementLayout} />
</TreeView>
