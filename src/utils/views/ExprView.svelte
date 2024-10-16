<script lang="ts">
  import { Effect } from "effect";
  import { dexMakeSvelteScope, DexRuntime } from "../utils/DexRuntime";

  import { Expr } from "src/ex-object/Expr";
  import ExprSelect from "src/utils/views/ExprSelect.svelte";
  import FocusView from "src/utils/views/FocusView.svelte";
  import type { Readable } from "svelte/store";
  import type { ElementLayout } from "../layout/ElementLayout";
  import NodeView from "../layout/NodeView.svelte";
  import type { DexSetup } from "../utils/EffectUtils";
  import type { FocusViewPropIn } from "./FocusView";
  import type { ExprViewState } from "./ExprView";

  export let setup: DexSetup<ExprViewState>;

  let expr: Expr;
  let text: Readable<string>;
  let isEditing: Readable<boolean>;
  let args: Readable<Expr[]>;
  let elementLayout: ElementLayout;
  let focusViewPropIn: FocusViewPropIn;

  dexMakeSvelteScope().then((scope) => {
    Effect.gen(function* () {
      const state = yield* setup(scope);
      expr = state.expr;
      text = state.text;
      isEditing = state.isEditing;
      args = state.args;
      elementLayout = state.elementLayout;
      focusViewPropIn = state.focusViewPropIn;
    }).pipe(DexRuntime.runPromise);
  });
</script>

<NodeView {elementLayout} elementKey={expr.id}>
  <FocusView propIn={focusViewPropIn}>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    <div
      class="rounded-sm card card-compact card-bordered px-2 container bg-base-100 font-mono"
    >
      {#if false}
        <span
          class="absolute w-max rounded-sm pointer-events-none border-base-200 border bg-base-100 top-0 left-full ml-2 tooltip p-2 z-10"
          >Expr {expr.ordinal}</span
        >
      {/if}
      <span>{$text}</span>

      <div class="pl-2">
        {#each $args as arg (arg.id)}
          <svelte:self expr={arg} {elementLayout} />
        {/each}
      </div>
    </div>
  </FocusView>

  {#if $isEditing}
    <ExprSelect {expr} />
  {/if}
</NodeView>

<style>
</style>
