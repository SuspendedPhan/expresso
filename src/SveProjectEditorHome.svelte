<script lang="ts">
  import { Effect } from "effect";
  import { AppStateCtx } from "./AppStateCtx";
  import type { DexProject } from "./DexDomain";
  import { DexGetter } from "./DexGetter";
  import { DexReducer } from "./DexReducer";
  import { DexRuntime, DexRuntime_RunReducer } from "./DexRuntime";
  import SveRootObject from "./SveRootObject.svelte";

  let ready = false;
  let project: DexProject | null;

  Effect.gen(function* () {
    const appState = yield* AppStateCtx.getAppState;
    project = DexGetter.ProjectEditorHome.getProject(appState);
    ready = true;
  }).pipe(DexRuntime.runPromise);

  function createProject() {
    console.log("createProject");
    DexRuntime_RunReducer(DexReducer.AppState.addProject());
  }

  function addObject() {
    DexRuntime_RunReducer(DexReducer.DexProject.addObject());
  }
</script>

{#if ready}
  {#if project === null}
    <button on:click={createProject}>Create Project</button>
  {:else}
    <div>{project.name}</div>
    {#each project.objects as rootObject}
      <SveRootObject dexObject={rootObject} />
    {/each}
    <button on:click={addObject}>Add Root Object</button>
  {/if}
{/if}
