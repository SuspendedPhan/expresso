<script lang="ts">
  import type { AppState } from "./AppState";
  import ProjectEditorHome from "./SveProjectEditorHome.svelte";

  export let state: AppState;
</script>

{#if state.activeWindow._tag === "ProjectEditorHome"}
  <ProjectEditorHome />
{/if}
