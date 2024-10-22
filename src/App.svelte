<script lang="ts">
  import { Effect } from "effect";
  import type { Readable } from "svelte/store";
  import { AppStateCtx } from "./AppStateCtx";
  import type { AppState } from "./AppState";
  import { DexRuntime } from "./DexRuntime";
  import SveAppState from "./SveAppState.svelte";
  import { DexId } from "./DexId";
  import { DexObject, makeDexProject } from "./Domain";

  const a = DexObject({ id: DexId.make(), name: "a", children: [] });
  const project = makeDexProject({ dexObjects: [a] });
  console.log(project);

  let appState: Readable<AppState>;
  Effect.gen(function* () {
    appState = yield* AppStateCtx.getState;
  }).pipe(DexRuntime.runPromise);
</script>

{#if appState}
  <SveAppState state={$appState} />
{/if}
