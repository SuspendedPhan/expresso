<script lang="ts">
  import { Effect, Scope, Exit } from "effect";
  import type { Expr } from "src/ex-object/Expr";
  import { DexRuntime } from "src/utils/utils/DexRuntime";

  import { onMount } from "svelte";
  import Combobox from "./Combobox.svelte";
  import type { ComboboxFieldPropsIn } from "./ComboboxField";
  import type { ExprSelectOption } from "../utils/ExprSelect";

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

  let comboboxProps: ComboboxFieldPropsIn<ExprSelectOption>;
  let ready = false;

  Effect.gen(function* () {
    const exprSelectCtx = yield* ExprSelectCtx;

    scope = yield* Scope.make();
    comboboxProps = yield* Scope.extend(
      exprSelectCtx.createComboboxFieldPropsIn(expr),
      scope
    );

    ready = true;
  }).pipe(DexRuntime.runPromise);
</script>

{#if ready}
  <Combobox propsIn={comboboxProps} />
{/if}
