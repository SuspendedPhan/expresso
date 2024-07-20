<script lang="ts">
  import { map } from "rxjs";
  import Main from "src/utils/utils/Main";
  import AppLayoutView from "./AppLayoutView.svelte";

  const main$ = Main.setup$();
  const ctx$ = main$.pipe(map((main) => main.ctx));
</script>

<div>
  {#if $ctx$}
    <AppLayoutView ctx={$ctx$} />
  {/if}
</div>

<style></style>
