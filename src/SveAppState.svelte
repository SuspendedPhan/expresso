<script lang="ts">
  import type { AppState } from "./AppState";
  import ProjectEditorHome from "./ProjectEditorHome.svelte";

  export let state: AppState;
</script>

{#if state.activeWindow._tag === "ProjectEditorHome"}
  <ProjectEditorHome projectEditorHome={state.activeWindow} />
{/if}
