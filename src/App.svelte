<script lang="ts">
  import MainView from "src/utils/views/MainView.svelte";
  import TestView from "src/utils/utils/TestView.svelte";

  let test = (function () {
    return false;
    return true;
  })();
</script>

{#if test}
  <TestView />
{:else}
  <MainView />
{/if}

<style></style>
