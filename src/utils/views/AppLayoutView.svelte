<script lang="ts">
  import MainContext from "src/main-context/MainContext";
  import SceneView from "src/scene/SceneView.svelte";
  import { onMount } from "svelte";
  import { FirebaseAuthentication } from "../persistence/FirebaseAuthentication";
  import EditorView from "./EditorView.svelte";

  export let ctx: MainContext;

  onMount(() => {
    FirebaseAuthentication.init();
  });
</script>

<div id="firebaseui-auth-container"></div>

<div class="flex">
  <div class="grow-0 shrink-0 basis-1/2" style="overflow: scroll;">
    <EditorView {ctx} />
  </div>
  <div class="grow-1 shrink-0 basis-1/2">
    <SceneView {ctx} />
  </div>
</div>

<style></style>
