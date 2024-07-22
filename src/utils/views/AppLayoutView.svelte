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

<div class="grid grid-cols-2">
  <div class="">
    <EditorView {ctx} />
  </div>
  <div class="">
    <SceneView {ctx} />
  </div>
</div>

<style></style>
