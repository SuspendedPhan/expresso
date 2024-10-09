<script lang="ts">
  import { Effect, Exit, Scope } from "effect";
  import type { Expr } from "src/ex-object/Expr";
  import { DexRuntime } from "src/utils/utils/DexRuntime";

  import { onMount } from "svelte";
  import { ExprSelectCtx, type ExprSelectOption } from "../utils/ExprSelect";
  import type { ComboboxPropsIn } from "./Combobox";
  import Combobox from "./Combobox.svelte";

  export let expr: Expr;

  let scope: Scope.CloseableScope = null as any;

  onMount(() => {
    return () => {
      DexRuntime.runPromise(
        Effect.gen(function* () {
          yield* Scope.close(scope, Exit.succeed(void 0));
        })
      );
    };
  });

  let comboboxProps: ComboboxPropsIn<ExprSelectOption>;
  let ready = false;

  Effect.gen(function* () {
    const exprSelectCtx = yield* ExprSelectCtx;

    scope = yield* Scope.make();
    comboboxProps = yield* Scope.extend(
      exprSelectCtx.createComboboxPropsIn(expr),
      scope
    );

    yield* Effect.sleep(0);
    ready = true;
  }).pipe(DexRuntime.runPromise);
</script>

{#if ready}
  <Combobox propsIn={comboboxProps} />
{/if}
