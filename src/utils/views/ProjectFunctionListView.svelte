<script lang="ts">
  import { switchMap } from "rxjs";
  import type MainContext from "src/main-context/MainContext";
  import ActionBar from "src/utils/views/ActionBar.svelte";
  import ActionBarButton from "src/utils/views/ActionBarButton.svelte";
  import ExFuncView from "src/utils/views/ExFuncView.svelte";
  import MainPane from "src/utils/views/MainPane.svelte";

  export let ctx: MainContext;
  const project$ = ctx.projectManager.currentProject$;
  const exFuncArr$ = project$.pipe(
    switchMap((project) => project.exFuncObsArr.itemArr$)
  );
</script>

<MainPane>
  <ActionBar>
    <ActionBarButton on:click={() => ctx.mutator.addBlankProjectExFunc()}
      >Add ExFunc</ActionBarButton
    >
  </ActionBar>
  {#each $exFuncArr$ as exFunc}
    <ExFuncView {ctx} {exFunc} />
  {/each}
</MainPane>
