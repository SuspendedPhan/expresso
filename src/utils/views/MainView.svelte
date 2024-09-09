<script lang="ts">
  import { map } from "rxjs";
  import Main from "src/utils/utils/DexRuntime";
  import AppLayoutView from "./AppLayoutView.svelte";

  const main$ = Main.setup$();
  const ctx$ = main$.pipe(map((main) => main.ctx));
</script>

{#if $ctx$}
  <AppLayoutView ctx={$ctx$} />
{/if}

<style></style>
