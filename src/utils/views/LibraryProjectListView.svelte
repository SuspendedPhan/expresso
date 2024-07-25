<script lang="ts">
  import MainContext from "src/main-context/MainContext";

  export let ctx: MainContext;

  const projects$ = ctx.projectManager.libraryProjects$;
  $: console.log($projects$);
</script>

{#each $projects$ as project}
  <div>{project.id}</div>
  <div>{project.name}</div>
{/each}
