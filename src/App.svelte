<script lang="ts">
  import MainView from "./views/MainView.svelte";
  import TestView from "./utils/utils/TestView.svelte";

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
</main>

<style></style>
