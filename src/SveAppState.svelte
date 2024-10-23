<script lang="ts">
  import type { AppState } from "./AppState";
  import ProjectEditorHome from "./SveProjectEditorHome.svelte";

  export let state: AppState;
</script>

{#key state}
  {#if state.activeWindow._tag === "ProjectEditorHome"}
    <ProjectEditorHome />
  {/if}
{/key}
