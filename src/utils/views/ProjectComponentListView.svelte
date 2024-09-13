<script lang="ts">
  import { Effect } from "effect";
  import { DexRuntime } from "src/utils/utils/DexRuntime";

  import { Project } from "src/ex-object/Project";
  import type { OBS } from "src/utils/utils/Utils";
  import ActionBarButton from "src/utils/views/ActionBarButton.svelte";
  import ComponentView from "src/utils/views/ComponentView.svelte";
  import MainPane from "src/utils/views/MainPane.svelte";
  import ActionBar from "src/utils/views/ActionBar.svelte";

  let components$: OBS<any[]>;

  DexRuntime.runPromise(
    Effect.gen(function* () {
      const project = yield* Project.activeProject;
      components$ = project.components.items$;
    })
  );

  function addBlankProjectComponent() {
    DexRuntime.runPromise(
      Effect.gen(function* () {
        const project = yield* Project.activeProject;
        yield* Project.Methods(project).addComponentBlank();
      })
    );
  }
</script>

<MainPane>
  <ActionBar>
    <ActionBarButton on:click={addBlankProjectComponent}>
      Add Component
    </ActionBarButton>
  </ActionBar>
  {#if components$ !== undefined}
    {#each $components$ as component}
      <ComponentView {component} />
    {/each}
  {/if}
</MainPane>
