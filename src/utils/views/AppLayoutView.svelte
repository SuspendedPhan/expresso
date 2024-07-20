<script lang="ts">
  import MainContext from "src/main-context/MainContext";
  import SceneView from "src/scene/SceneView.svelte";
  import EditorView from "./EditorView.svelte";

  export let ctx: MainContext;
</script>

<div class="grid grid-cols-2">
  <div class="">
    <EditorView {ctx} />
  </div>
  <div class="">
    <SceneView {ctx} />
  </div>
</div>

<style></style>
