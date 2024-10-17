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

  let ready = false;

  dexMakeSvelteScope().then((scope) => {
    Effect.gen(function* () {
      const state = yield* setup(scope);
      nameFieldPropIn = state.nameFieldPropIn;
      rootExprViewSetup = state.rootExprViewSetup;
      isNumberExpr = state.isNumberExpr;

      ready = true;
    }).pipe(DexRuntime.runPromise);
  });
</script>

{#if ready}
  <div class:flex={$isNumberExpr} class="items-center font-mono">
    <div class="flex flex-row">
      <TextField setup={nameFieldPropIn} />
      <pre class="text-style-secondary"> = </pre>
    </div>

    {#if $rootExprViewSetup}
      <RootExprView setup={$rootExprViewSetup} />
    {/if}
  </div>
{/if}
