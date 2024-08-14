<script lang="ts">
  import { switchMap } from "rxjs";
  import type MainContext from "src/main-context/MainContext";
  import ActionBar from "src/utils/views/ActionBar.svelte";
  import ActionBarButton from "src/utils/views/ActionBarButton.svelte";
  import ComponentView from "src/utils/views/ComponentView.svelte";
  import FlexContainer from "src/utils/views/FlexContainer.svelte";

  export let ctx: MainContext;
  const project$ = ctx.projectManager.currentProject$;
  const componentL$ = project$.pipe(
    switchMap((project) => project.componentArr$)
  );
</script>

<FlexContainer class="p-window gap-y-8">
  <ActionBar>
    <ActionBarButton on:click={() => ctx.mutator.addBlankProjectComponent()}
      >Add Component</ActionBarButton
    >
  </ActionBar>
  {#each $componentL$ as component}
    <ComponentView {ctx} {component} />
  {/each}
</FlexContainer>
