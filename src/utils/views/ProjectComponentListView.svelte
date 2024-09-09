<script lang="ts">
  import { switchMap } from "rxjs";

  import ActionBar from "src/utils/views/ActionBar.svelte";
  import ActionBarButton from "src/utils/views/ActionBarButton.svelte";
  import ComponentView from "src/utils/views/ComponentView.svelte";
  import MainPane from "src/utils/views/MainPane.svelte";

  const project$ = ctx.projectManager.currentProject$;
  const componentL$ = project$.pipe(
    switchMap((project) => project.componentArr$)
  );
</script>

<MainPane>
  <ActionBar>
    <ActionBarButton on:click={() => ctx.mutator.addBlankProjectComponent()}
      >Add Component</ActionBarButton
    >
  </ActionBar>
  {#each $componentL$ as component}
    <ComponentView {ctx} {component} />
  {/each}
</MainPane>
