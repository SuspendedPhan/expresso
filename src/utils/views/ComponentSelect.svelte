<script lang="ts">
  import { Effect, Exit, Scope } from "effect";
  import type { ExObject } from "src/ex-object/ExObject";
  import { DexRuntime } from "src/utils/utils/DexRuntime";
  import { type ComboboxPropsIn } from "src/utils/views/Combobox";
  import Combobox from "src/utils/views/Combobox.svelte";
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

  let comboboxPropsIn: ComboboxPropsIn<ComponentOption>;
  DexRuntime.runPromise(
    Effect.gen(function* () {
      const componentSelectCtx = yield* ComponentSelectCtx;

      scope = yield* Scope.make();
      comboboxPropsIn = yield* Scope.extend(
        componentSelectCtx.createComboboxProps(),
        scope
      );
    })
  );
</script>

<Combobox propsIn={comboboxPropsIn} />
