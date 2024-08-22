<script lang="ts">
  import MainContext from "src/main-context/MainContext";
  import { Constants } from "../utils/ViewUtils";
  import LibraryProjectView from "./LibraryProjectView.svelte";
  import { switchMap } from "rxjs";

  export let ctx: MainContext;

  const projects$ = ctx.library$.pipe(
    switchMap((library) => library.libraryProjectArr$)
  );
  $: console.log($projects$);
</script>

<div class={Constants.WindowPaddingClass}>
  <table class="table">
    <tbody
      >{#each $projects$ as project}
        <LibraryProjectView {ctx} {project} />
      {/each}</tbody
    >
  </table>
</div>
