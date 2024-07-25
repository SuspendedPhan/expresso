<script lang="ts">
  import MainContext from "src/main-context/MainContext";
  import { Constants } from "../utils/ViewUtils";

  export let ctx: MainContext;

  const projects$ = ctx.projectManager.libraryProjects$;
  $: console.log($projects$);
</script>

<div class={Constants.WindowPaddingClass}>
  <table class="table">
    <tbody
      >{#each $projects$ as project}
        <tr>
          <td>{project.id}</td>
          <td>{project.name}</td>
        </tr>
      {/each}</tbody
    >
  </table>
</div>
