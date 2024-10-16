<script lang="ts">
  import { Effect } from "effect";
  import type { ElementLayout } from "src/utils/layout/ElementLayout";
  import { DexRuntime } from "src/utils/utils/DexRuntime";
  import TreeView from "../layout/TreeView.svelte";
  import { dexMakeSvelteScope } from "../utils/DexRuntime";
  import type { DexSetup } from "../utils/EffectUtils";
  import type { ExprViewState } from "./ExprView";
  import ExprView from "./ExprView.svelte";
  import type { RootExprViewState } from "./RootExprView";

  export let setup: DexSetup<RootExprViewState>;

  let exprViewSetup: DexSetup<ExprViewState>;
  let elementLayout: ElementLayout;

  dexMakeSvelteScope().then((scope) => {
    Effect.gen(function* () {
      const state = yield* setup(scope);
      exprViewSetup = state.exprViewSetup;
      elementLayout = state.elementLayout;
    }).pipe(DexRuntime.runPromise);
  });
</script>

<TreeView {elementLayout}>
  <ExprView setup={exprViewSetup} />
</TreeView>
