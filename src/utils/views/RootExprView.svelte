<script lang="ts">
  import { Effect } from "effect";
  import type { ElementLayout } from "src/utils/layout/ElementLayout";
  import { createExprLayout } from "src/utils/layout/ExprLayout";
  import { DexRuntime } from "src/utils/utils/DexRuntime";
  import TreeView from "../layout/TreeView.svelte";
  import ExprView from "./ExprView.svelte";

  export let expr;

  let elementLayout: ElementLayout;
  DexRuntime.runPromise(
    Effect.gen(function* () {
      elementLayout = yield* createExprLayout(expr);
    })
  );
</script>

<TreeView {elementLayout}>
  <ExprView {expr} {elementLayout} />
</TreeView>
