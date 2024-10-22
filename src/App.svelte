<script lang="ts">
  import { Effect } from "effect";
  import type { Readable } from "svelte/store";
  import { AppStateCtx } from "./AppStateCtx";
  import type { AppState } from "./AppState";
  import { DexRuntime } from "./DexRuntime";
  import SveAppState from "./SveAppState.svelte";

  let appState: Readable<AppState>;
  Effect.gen(function* () {
    appState = yield* AppStateCtx.getAppStateReadable;
  }).pipe(DexRuntime.runPromise);
</script>

{#if appState}
  <SveAppState state={$appState} />
{/if}
