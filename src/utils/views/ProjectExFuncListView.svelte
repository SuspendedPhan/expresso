<script lang="ts">
  import { switchMap } from "rxjs";

  import ActionBar from "src/utils/views/ActionBar.svelte";
  import ActionBarButton from "src/utils/views/ActionBarButton.svelte";
  import ExFuncView from "src/utils/views/ExFuncView.svelte";
  import MainPane from "src/utils/views/MainPane.svelte";

  const project$ = ctx.projectManager.currentProject$;
  const exFuncArr$ = project$.pipe(
    switchMap((project) => project.exFuncObsArr.itemArr$)
  );
</script>

<MainPane>
  <ActionBar>
    <ActionBarButton on:click={() => ctx.projectCtx.addExFuncBlank()}
      >Add Function</ActionBarButton
    >
  </ActionBar>
  {#each $exFuncArr$ as exFunc}
    <ExFuncView {ctx} {exFunc} />
  {/each}
</MainPane>
