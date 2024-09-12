<script lang="ts">
  import { Effect } from "effect";
  import { DexRuntime } from "src/utils/utils/DexRuntime";

  import { ProjectCtx } from "src/ctx/ProjectCtx";
  import { Project } from "src/ex-object/Project";
  import type { OBS } from "src/utils/utils/Utils";
  import ActionBarButton from "src/utils/views/ActionBarButton.svelte";
  import ComponentView from "src/utils/views/ComponentView.svelte";
  import MainPane from "src/utils/views/MainPane.svelte";
  import ActionBar from "src/utils/views/ActionBar.svelte";

  let components$: OBS<any[]>;

  DexRuntime.runPromise(
    Effect.gen(function* () {
      const project = yield* ProjectCtx.activeProject;
      components$ = project.components.items$;
    })
  );

  function addBlankProjectComponent() {
    DexRuntime.runPromise(
      Effect.gen(function* () {
        const project = yield* ProjectCtx.activeProject;
        yield* Project.Methods(project).addComponentBlank();
      })
    );
  }
</script>

<MainPane>
  <ActionBar asdf="hi">
    <ActionBarButton on:click={addBlankProjectComponent}>
      Add Component
    </ActionBarButton>
  </ActionBar>
  {#each $components$ as component}
    <ComponentView {component} />
  {/each}
</MainPane>
