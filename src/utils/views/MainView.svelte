<script lang="ts">
  import { map } from "rxjs";
  import Main from "src/utils/utils/Main";
  import RootView from "./RootView.svelte";

  const main$ = Main.setup$();
  const ctx$ = main$.pipe(map((main) => main.ctx));
</script>

<div>
  <div>Main View</div>
  {#if $ctx$}
    <RootView ctx={$ctx$} />
  {/if}
</div>

<style></style>
