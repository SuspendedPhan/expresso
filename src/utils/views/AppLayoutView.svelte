<script lang="ts">
  import MainContext from "src/main-context/MainContext";
  import SceneView from "src/scene/SceneView.svelte";
  import EditorView from "./EditorView.svelte";

  export let ctx: MainContext;
</script>

<div>
  <EditorView {ctx} />
  <SceneView {ctx} />
</div>

<style></style>
