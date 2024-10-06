<!-- todp rename to componentfield -->
<script lang="ts">
  import { Effect, Exit, Scope } from "effect";
  import type { ExObject } from "src/ex-object/ExObject";
  import { DexRuntime } from "src/utils/utils/DexRuntime";
  import type { ComboboxFieldPropsIn } from "src/utils/views/ComboboxField";
  import ComboboxField from "src/utils/views/ComboboxField.svelte";
  import {
    ComponentSelectCtx,
    type ComponentOption,
  } from "src/utils/views/ComponentSelect";
  import { onMount } from "svelte";

  export let exObject: ExObject = null as any;

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

  let comboboxFieldPropsIn: ComboboxFieldPropsIn<ComponentOption>;
  let ready = false;

  DexRuntime.runPromise(
    Effect.gen(function* () {
      const componentSelectCtx = yield* ComponentSelectCtx;

      // todp: reference fieldvaluedata
      scope = yield* Scope.make();
      comboboxFieldPropsIn = yield* Scope.extend(
        componentSelectCtx.createComboboxFieldPropsIn(exObject),
        scope
      );

      ready = true;
    })
  );
</script>

{#if ready}
  <ComboboxField propsIn={comboboxFieldPropsIn} />
{/if}
