<script lang="ts">
  import { Effect } from "effect";
  import { dexMakeSvelteScope, DexRuntime } from "../utils/DexRuntime";
  import type { DexSetup } from "../utils/EffectUtils";
  import ComboboxField from "./ComboboxField.svelte";
  import type { ComponentSelectState } from "./ComponentSelect";

  export let setup: DexSetup<ComponentSelectState>;
  let comboboxFieldProp: ComponentSelectState["comboboxFieldProp"];

  dexMakeSvelteScope().then((scope) => {
    Effect.gen(function* () {
      const state = yield* setup(scope);
      comboboxFieldProp = state.comboboxFieldProp;
    }).pipe(DexRuntime.runPromise);
  });
</script>

<ComboboxField propsIn={comboboxFieldProp} />
