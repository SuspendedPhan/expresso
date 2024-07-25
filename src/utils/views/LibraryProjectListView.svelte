<script lang="ts">
  import MainContext from "src/main-context/MainContext";
  import { Constants } from "../utils/ViewUtils";

  export let ctx: MainContext;

  const projects$ = ctx.projectManager.libraryProjects$;
  $: console.log($projects$);
</script>

<div class={Constants.WindowPaddingClass}>
  {#each $projects$ as project}
    <div>{project.id}</div>
    <div>{project.name}</div>
  {/each}
</div>
