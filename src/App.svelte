<script lang="ts">
  import DebugOverlay from "./debug-overlay/DebugOverlay.svelte";
  import MainView from "./MainView.svelte";
  import TestView from "./utils/TestView.svelte";

  let test = (function () {
    return false;
    return true;
  })();
</script>

<main>
  {#if test}
    <TestView />
  {:else}
    <MainView />
  {/if}
  <DebugOverlay />
</main>

<style></style>
