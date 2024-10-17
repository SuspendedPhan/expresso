<script lang="ts">
  import { Effect } from "effect";
  import RootExprView from "src/utils/views/RootExprView.svelte";
  import { dexMakeSvelteScope, DexRuntime } from "../utils/DexRuntime";
  import type { DexSetup } from "../utils/EffectUtils";
  import type { PropertyViewState } from "./PropertyView";
  import TextField from "./TextField.svelte";

  let nameFieldPropIn: PropertyViewState["nameFieldPropIn"];
  let rootExprViewSetup: PropertyViewState["rootExprViewSetup"];
  let isNumberExpr: PropertyViewState["isNumberExpr"];

  export let setup: DexSetup<PropertyViewState>;

  dexMakeSvelteScope().then((scope) => {
    Effect.gen(function* () {
      const state = yield* setup(scope);
      nameFieldPropIn = state.nameFieldPropIn;
      rootExprViewSetup = state.rootExprViewSetup;
      isNumberExpr = state.isNumberExpr;
    }).pipe(DexRuntime.runPromise);
  });
</script>

<div class:flex={$isNumberExpr} class="items-center font-mono">
  <div class="flex flex-row">
    <TextField setup={nameFieldPropIn} />
    <pre class="text-style-secondary"> = </pre>
  </div>

  <RootExprView setup={$rootExprViewSetup} />
</div>
