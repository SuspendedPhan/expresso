<script lang="ts">
  import { Effect } from "effect";
  import { AppStateCtx } from "./AppStateCtx";
  import type { DexProject } from "./DexDomain";
  import { DexGetter } from "./DexGetter";
  import { DexReducer } from "./DexReducer";
  import { DexRuntime } from "./DexRuntime";

  let ready = false;
  let project: DexProject | null;

  Effect.gen(function* () {
    const appState = yield* AppStateCtx.getAppState;
    project = DexGetter.ProjectEditorHome.getProject(appState);
    ready = true;
  }).pipe(DexRuntime.runPromise);

  function createProject() {
    Effect.gen(function* () {
      yield* AppStateCtx.applyAppStateReducer(DexReducer.AppState.addProject());
    }).pipe(DexRuntime.runPromise);
  }

  function addObject() {
    Effect.gen(function* () {
      yield* AppStateCtx.applyProjectReducer(DexReducer.DexProject.addObject());
    }).pipe(DexRuntime.runPromise);
  }
</script>

{#if ready}
  {#if project === null}
    <button on:click={createProject}>Create Project</button>
  {:else}
    <div>{project.name}</div>
    {#each project.objects as rootObject}
      <div>{rootObject.name}</div>
    {/each}
    <button on:click={addObject}>Add Root Object</button>
  {/if}
{/if}
