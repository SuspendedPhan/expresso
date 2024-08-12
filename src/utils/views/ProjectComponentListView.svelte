<script lang="ts">
  import { switchMap } from "rxjs";
  import MainContext from "src/main-context/MainContext";
  import ComponentView from "src/utils/views/ComponentView.svelte";

  export let ctx: MainContext;
  const project$ = ctx.projectManager.currentProject$;
  const componentL$ = project$.pipe(
    switchMap((project) => project.customComponentL$)
  );
</script>

{#each $componentL$ as component}
  <ComponentView {ctx} {component} />
{/each}
