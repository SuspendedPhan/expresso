<script lang="ts">
  import { Effect } from "effect";
  import { AppStateCtx } from "./AppStateCtx";
  import type { DexProject } from "./DexDomain";
  import { DexGetter } from "./DexGetter";
  import { DexReducer } from "./DexReducer";
  import { DexRuntime } from "./DexRuntime";

  let ready = false;
  let project: DexProject;
  Effect.gen(function* () {
    const appState = yield* AppStateCtx.getAppState;
    project = DexGetter.ProjectEditorHome.getProject(appState);
    ready = true;
  }).pipe(DexRuntime.runPromise);

  function onclick() {
    Effect.gen(function* () {
      yield* AppStateCtx.applyProjectReducer(DexReducer.DexProject.addObject());
    }).pipe(DexRuntime.runPromise);
  }
</script>

{#if ready}
  {#each project.objects as rootObject}
    <div>{rootObject.name}</div>
  {/each}
  <button on:click={onclick}>Add Root Object</button>
{/if}
