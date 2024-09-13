<script lang="ts">
  import { Effect } from "effect";
  import { DexRuntime } from "src/utils/utils/DexRuntime";

  import type { OBS } from "src/utils/utils/Utils";

  import ActionBar from "src/utils/views/ActionBar.svelte";
  import ActionBarButton from "src/utils/views/ActionBarButton.svelte";
  import ExFuncView from "src/utils/views/ExFuncView.svelte";
  import MainPane from "src/utils/views/MainPane.svelte";
  import { Project } from "src/ex-object/Project";

  let exFuncArr$: OBS<any[]>;

  DexRuntime.runPromise(
    Effect.gen(function* () {
      const project = yield* Project.activeProject;
      exFuncArr$ = project.exFuncs.items$;
    })
  );

  function addBlankExFunc() {
    DexRuntime.runPromise(
      Effect.gen(function* () {
        const project = yield* Project.activeProject;
        yield* Project.Methods(project).addExFuncBlank();
      })
    );
  }
</script>

<MainPane>
  <ActionBar>
    <ActionBarButton on:click={addBlankExFunc}>Add Function</ActionBarButton>
  </ActionBar>
  {#if exFuncArr$ !== undefined}
    {#each $exFuncArr$ as exFunc}
      <ExFuncView {exFunc} />
    {/each}
  {/if}
</MainPane>
