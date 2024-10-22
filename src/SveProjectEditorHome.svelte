<script lang="ts">
  import { Effect } from "effect";
  import type { ProjectEditorHome } from "./AppState";
  import { DexRuntime } from "./DexRuntime";
  import { AppStateCtx } from "./AppStateCtx";

  export let projectEditorHome: ProjectEditorHome;

  function onclick() {
    Effect.gen(function* () {
      yield* AppStateCtx.addRootDexObject();
    }).pipe(DexRuntime.runPromise);
  }
</script>

{#each projectEditorHome.dexObjects as rootDexObject}
  <div>{rootDexObject.name}</div>
{/each}
<button on:click={onclick}>Add Root Object</button>
