<script lang="ts">
  import type { DexExpr } from "./DexDomain";
  import SveExpr from "./SveExpr.svelte";
  import type { ElementLayout } from "./utils/layout/ElementLayout";
  import { createExprLayout } from "./utils/layout/ExprLayout";
  import TreeView from "./utils/layout/TreeView.svelte";

  export let expr: DexExpr;
  const elementLayout: ElementLayout = createExprLayout(expr);
</script>

<TreeView {elementLayout}>
  <SveExpr {expr} {elementLayout} />
</TreeView>
